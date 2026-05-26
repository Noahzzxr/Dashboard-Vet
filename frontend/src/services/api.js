// Cliente de API com fallback para localStorage quando o backend local não estiver ativo
const API_URL = 'http://localhost:3000';

// Dados fictícios padrão para apresentação escolar
const MOCK_DATA_SEED = {
  tutores: [
    { id: 1, nome: "João Silva", cpf: "123.456.789-00", telefone: "(11) 98765-4321", email: "joao.silva@email.com", endereco: "Rua das Flores, 123" },
    { id: 2, nome: "Maria Oliveira", cpf: "987.654.321-11", telefone: "(21) 99888-7766", email: "maria.oliveira@email.com", endereco: "Av. Brasil, 456" },
    { id: 3, nome: "Carlos Souza", cpf: "456.789.123-22", telefone: "(31) 97777-8888", email: "carlos.souza@email.com", endereco: "Alameda dos Anjos, 789" }
  ],
  pets: [
    { id: 1, nome: "Rex", especie: "Cão", raca: "Labrador", idadeAnos: 3, idadeMeses: 2, tutorId: 1, peso: 32.5, observacoes: "Alérgico a picada de pulga." },
    { id: 2, nome: "Whiskers", especie: "Gato", raca: "Siamês", idadeAnos: 1, idadeMeses: 6, tutorId: 2, peso: 4.2, observacoes: "Castrado, vacinação em dia." },
    { id: 3, nome: "Mel", especie: "Cão", raca: "Poodle", idadeAnos: 8, idadeMeses: 0, tutorId: 1, peso: 6.0, observacoes: "Necessita de cuidados cardíacos." },
    { id: 4, nome: "Pipoca", especie: "Calopsita", raca: "Mansa", idadeAnos: 0, idadeMeses: 8, tutorId: 3, peso: 0.09, observacoes: "Muito ativa e saudável." }
  ],
  veterinarios: [
    { id: 1, nome: "Dra. Ana Beatriz", crmv: "CRMV-SP 12345", especialidade: "Clínica Geral", telefone: "(11) 91111-2222", email: "ana.beatriz@vetclinic.com" },
    { id: 2, nome: "Dr. Ricardo Santos", crmv: "CRMV-SP 67890", especialidade: "Cirurgia", telefone: "(11) 93333-4444", email: "ricardo.santos@vetclinic.com" },
    { id: 3, nome: "Dra. Camila Lima", crmv: "CRMV-SP 54321", especialidade: "Dermatologia", telefone: "(11) 95555-6666", email: "camila.lima@vetclinic.com" }
  ],
  consultas: [
    { id: 1, petId: 1, veterinarioId: 1, data: "2026-05-28", hora: "10:00", sintomas: "Consulta de rotina e vacinação", diagnostico: "", status: "Agendada" },
    { id: 2, petId: 2, veterinarioId: 3, data: "2026-05-29", hora: "14:30", sintomas: "Coceira intensa nas orelhas", diagnostico: "", status: "Agendada" },
    { id: 3, petId: 3, veterinarioId: 2, data: "2026-05-25", hora: "09:00", sintomas: "Avaliação cardíaca", diagnostico: "Sopro cardíaco estável. Continuar medicação atual.", status: "Realizada" }
  ]
};

// Inicializa o localStorage caso não esteja configurado
function initLocalStorage() {
  if (!localStorage.getItem('vet_clinic_db')) {
    localStorage.setItem('vet_clinic_db', JSON.stringify(MOCK_DATA_SEED));
  }
}
initLocalStorage();

// Auxiliares do LocalStorage
function getLocalDB() {
  initLocalStorage();
  return JSON.parse(localStorage.getItem('vet_clinic_db'));
}

function saveLocalDB(db) {
  localStorage.setItem('vet_clinic_db', JSON.stringify(db));
}

// Função utilitária para fazer requisições com Fallback para localStorage
async function request(endpoint, method = 'GET', data = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API Info] Falha na comunicação com o backend (${url}). Usando fallback offline do LocalStorage.`, error.message);
    
    // Fallback Inteligente usando LocalStorage
    return handleLocalRequest(endpoint, method, data);
  }
}

// Roteamento interno do mock LocalStorage
function handleLocalRequest(endpoint, method, data) {
  const db = getLocalDB();
  
  // Extrai recurso e ID do endpoint (ex: /tutores ou /tutores/1)
  const parts = endpoint.split('/').filter(p => p);
  const resource = parts[0]; // e.g. 'tutores', 'pets', 'veterinarios', 'consultas'
  const id = parts[1] ? parseInt(parts[1], 10) : null;

  if (!db[resource]) {
    throw new Error(`Recurso não encontrado no LocalStorage: ${resource}`);
  }

  if (method === 'GET') {
    if (id) {
      const item = db[resource].find(x => x.id === id);
      if (!item) throw new Error(`Item ${id} não encontrado em ${resource}`);
      return item;
    }
    return db[resource];
  }

  if (method === 'POST') {
    // Gerar um ID autoincremento
    const nextId = db[resource].reduce((max, item) => item.id > max ? item.id : max, 0) + 1;
    const newItem = { ...data, id: nextId };
    db[resource].push(newItem);
    saveLocalDB(db);
    return newItem;
  }

  if (method === 'PUT') {
    if (!id) throw new Error(`ID necessário para atualização em ${resource}`);
    const index = db[resource].findIndex(x => x.id === id);
    if (index === -1) throw new Error(`Item ${id} não encontrado em ${resource}`);
    
    db[resource][index] = { ...db[resource][index], ...data, id }; // preserva ID
    saveLocalDB(db);
    return db[resource][index];
  }

  if (method === 'DELETE') {
    if (!id) throw new Error(`ID necessário para exclusão em ${resource}`);
    const index = db[resource].findIndex(x => x.id === id);
    if (index === -1) throw new Error(`Item ${id} não encontrado em ${resource}`);
    
    const deletedItem = db[resource].splice(index, 1)[0];
    saveLocalDB(db);
    return deletedItem;
  }
}

// Exportações das operações solicitadas
export const api = {
  // Tutores
  getTutores: () => request('/tutores'),
  getTutor: (id) => request(`/tutores/${id}`),
  createTutor: (data) => request('/tutores', 'POST', data),
  updateTutor: (id, data) => request(`/tutores/${id}`, 'PUT', data),
  deleteTutor: (id) => request(`/tutores/${id}`, 'DELETE'),

  // Pets
  getPets: () => request('/pets'),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (data) => request('/pets', 'POST', data),
  updatePet: (id, data) => request(`/pets/${id}`, 'PUT', data),
  deletePet: (id) => request(`/pets/${id}`, 'DELETE'),

  // Veterinários
  getVeterinarios: () => request('/veterinarios'),
  getVeterinario: (id) => request(`/veterinarios/${id}`),
  createVeterinario: (data) => request('/veterinarios', 'POST', data),
  updateVeterinario: (id, data) => request(`/veterinarios/${id}`, 'PUT', data),
  deleteVeterinario: (id) => request(`/veterinarios/${id}`, 'DELETE'),

  // Consultas
  getConsultas: () => request('/consultas'),
  getConsulta: (id) => request(`/consultas/${id}`),
  createConsulta: (data) => request('/consultas', 'POST', data),
  updateConsulta: (id, data) => request(`/consultas/${id}`, 'PUT', data),
  deleteConsulta: (id) => request(`/consultas/${id}`, 'DELETE')
};
