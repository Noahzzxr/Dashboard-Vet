<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api.js'
import PetForm from '../components/PetForm.vue'

const route = useRoute()

const pets = ref([])
const tutores = ref([])
const searchFilter = ref('')
const showModal = ref(false)
const editingPet = ref(null)
const isLoading = ref(true)

// Dicionário de IDs de tutores para acesso rápido
const tutoresMap = computed(() => {
  return tutores.value.reduce((acc, t) => ({ ...acc, [t.id]: t }), {})
})

const loadPetsAndTutores = async () => {
  try {
    isLoading.value = true
    const [petsData, tutoresData] = await Promise.all([
      api.getPets(),
      api.getTutores()
    ])
    pets.value = petsData
    tutores.value = tutoresData
  } catch (error) {
    console.error('Erro ao carregar dados dos pets:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPetsAndTutores()
  if (route.query.openForm === 'true') {
    openCreateModal()
  }
})

// Filtra pets por nome do pet ou nome do tutor
const filteredPets = computed(() => {
  if (!searchFilter.value.trim()) return pets.value
  const query = searchFilter.value.toLowerCase().trim()
  return pets.value.filter(p => {
    const petNameMatches = p.nome.toLowerCase().includes(query)
    const tutorName = tutoresMap.value[p.tutorId]?.nome || ''
    const tutorNameMatches = tutorName.toLowerCase().includes(query)
    return petNameMatches || tutorNameMatches
  })
})

const openCreateModal = () => {
  editingPet.value = null
  showModal.value = true
}

const openEditModal = (pet) => {
  editingPet.value = { ...pet }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingPet.value = null
}

const handleSave = async (petData) => {
  try {
    if (editingPet.value) {
      // Editar
      await api.updatePet(editingPet.value.id, petData)
    } else {
      // Criar
      await api.createPet(petData)
    }
    await loadPetsAndTutores()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar pet. Veja o console.')
    console.error(error)
  }
}

const handleDelete = async (id) => {
  if (confirm('Deseja realmente excluir este pet?')) {
    try {
      await api.deletePet(id)
      await loadPetsAndTutores()
    } catch (error) {
      alert('Erro ao excluir pet.')
      console.error(error)
    }
  }
}

// Retorna o emoticon apropriado baseado na espécie do paciente
const getEspecieIcon = (especie) => {
  const esp = especie.toLowerCase()
  if (esp.includes('cão') || esp.includes('cachorro') || esp.includes('dog')) return '🐶'
  if (esp.includes('gato') || esp.includes('cat')) return '🐱'
  if (esp.includes('ave') || esp.includes('pássaro') || esp.includes('bird') || esp.includes('calopsita')) return '🐦'
  if (esp.includes('roedor') || esp.includes('coelho') || esp.includes('hamster')) return '🐹'
  if (esp.includes('réptil') || esp.includes('cobra') || esp.includes('tartaruga')) return '🐢'
  return '🐾'
}
</script>

<template>
  <div class="pets-view">
    <!-- Cabeçalho da View -->
    <div class="view-header">
      <div>
        <h1 class="view-title">🐶 Pacientes (Pets)</h1>
        <p class="view-subtitle">Gerencie o prontuário básico, espécie, raça e tutores dos animais cadastrados.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span class="btn-icon">➕</span> Novo Pet
      </button>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchFilter" 
          placeholder="Buscar pet por nome ou responsável..." 
          class="search-input"
        />
      </div>
      <span class="results-count">{{ filteredPets.length }} pet(s) listado(s)</span>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="isLoading" class="loader-container">
      <div class="spinner"></div>
      <p>Consultando prontuários dos pets...</p>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="filteredPets.length === 0" class="empty-state">
      <div class="empty-icon">🐶</div>
      <h4>Nenhum pet encontrado</h4>
      <p v-if="searchFilter">Não há pets que correspondam ao filtro de busca informado.</p>
      <p v-else>Não há nenhum pet cadastrado no sistema clínica ainda.</p>
      <button v-if="!searchFilter" class="btn btn-primary" @click="openCreateModal">Cadastrar Primeiro Pet</button>
    </div>

    <!-- Lista de Pets em Cartões Interativos -->
    <div v-else class="pets-grid">
      <div v-for="pet in filteredPets" :key="pet.id" class="pet-card">
        <div class="pet-card-header">
          <div class="pet-avatar-wrapper">
            <span class="pet-avatar-icon">{{ getEspecieIcon(pet.especie) }}</span>
            <div class="pet-identity">
              <h3>{{ pet.nome }}</h3>
              <span class="pet-specie-badge">{{ pet.especie }} • {{ pet.raca }}</span>
            </div>
          </div>
          <div class="pet-actions">
            <button class="card-action-btn edit" title="Editar" @click="openEditModal(pet)">✏️</button>
            <button class="card-action-btn delete" title="Excluir" @click="handleDelete(pet.id)">🗑️</button>
          </div>
        </div>

        <div class="pet-card-body">
          <div class="info-row">
            <span class="info-label">Tutor Responsável:</span>
            <span class="info-value text-bold">
              👤 {{ tutoresMap[pet.tutorId]?.nome || 'Tutor não encontrado' }}
            </span>
          </div>

          <div class="info-row-grid">
            <div class="info-column">
              <span class="info-label">Idade:</span>
              <span class="info-value">
                {{ pet.idadeAnos }} {{ pet.idadeAnos === 1 ? 'ano' : 'anos' }}
                <span v-if="pet.idadeMeses > 0"> e {{ pet.idadeMeses }} {{ pet.idadeMeses === 1 ? 'mês' : 'meses' }}</span>
              </span>
            </div>

            <div class="info-column">
              <span class="info-label">Peso:</span>
              <span class="info-value">{{ pet.peso.toFixed(2) }} kg</span>
            </div>
          </div>

          <div class="pet-observations" v-if="pet.observacoes">
            <strong>📋 Alergias / Observações Clínicas:</strong>
            <p>{{ pet.observacoes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close-btn" @click="closeModal">&times;</button>
        <PetForm 
          :pet="editingPet" 
          :tutores="tutores"
          @save="handleSave" 
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.pets-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 1.7rem;
  font-weight: 750;
  color: hsl(215, 60%, 16%);
}

.view-subtitle {
  font-size: 0.95rem;
  color: hsl(215, 20%, 45%);
  margin-top: 0.25rem;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid hsl(210, 16%, 93%);
  flex-wrap: wrap;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 450px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: hsl(215, 20%, 55%);
}

.search-input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.3rem;
  border: 1.5px solid hsl(210, 16%, 86%);
  border-radius: 8px;
  font-size: 0.92rem;
  transition: all 0.3s;
  color: hsl(215, 60%, 16%);
}

.search-input:focus {
  outline: none;
  border-color: hsl(170, 75%, 41%);
  box-shadow: 0 0 0 3px rgba(44, 201, 172, 0.12);
}

.results-count {
  font-size: 0.88rem;
  color: hsl(215, 20%, 50%);
  font-weight: 600;
}

/* Grid de Cartões de Pets */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.pet-card {
  background: white;
  border-radius: 14px;
  border: 1px solid hsl(210, 16%, 92%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.pet-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  border-color: hsl(170, 75%, 82%);
}

.pet-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1.5px solid hsl(210, 16%, 95%);
  padding-bottom: 0.75rem;
}

.pet-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pet-avatar-icon {
  font-size: 2.2rem;
  background-color: hsl(210, 16%, 95%);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-identity h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: hsl(215, 60%, 16%);
}

.pet-specie-badge {
  font-size: 0.8rem;
  color: hsl(215, 20%, 48%);
  font-weight: 600;
}

.pet-actions {
  display: flex;
  gap: 0.35rem;
}

.card-action-btn {
  background: hsl(210, 16%, 96%);
  border: 1px solid hsl(210, 16%, 91%);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.8rem;
}

.card-action-btn:hover {
  transform: translateY(-1px);
}

.card-action-btn.edit:hover {
  background-color: hsl(170, 75%, 95%);
  border-color: hsl(170, 75%, 80%);
}

.card-action-btn.delete:hover {
  background-color: hsl(354, 70%, 95%);
  border-color: hsl(354, 70%, 85%);
}

/* Corpo do Cartão */
.pet-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.info-row-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.info-label {
  font-size: 0.78rem;
  color: hsl(215, 20%, 55%);
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 0.9rem;
  color: hsl(215, 45%, 22%);
}

.text-bold {
  font-weight: 650;
  color: hsl(215, 55%, 15%);
}

.pet-observations {
  background-color: hsl(210, 16%, 97%);
  border-left: 3px solid hsl(170, 75%, 41%);
  padding: 0.6rem 0.8rem;
  border-radius: 0 8px 8px 0;
  font-size: 0.82rem;
  margin-top: 0.25rem;
}

.pet-observations strong {
  display: block;
  color: hsl(215, 60%, 16%);
  margin-bottom: 0.2rem;
}

.pet-observations p {
  color: hsl(215, 20%, 35%);
  line-height: 1.4;
}

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(24, 34, 46, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

.modal-content {
  background: white;
  border-radius: 14px;
  width: 100%;
  max-width: 580px;
  position: relative;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: hsl(215, 20%, 60%);
  transition: color 0.2s;
  z-index: 10;
}

.modal-close-btn:hover {
  color: hsl(354, 70%, 54%);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Botões */
.btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 650;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.25s;
}

.btn-primary {
  background-color: hsl(170, 75%, 41%);
  color: white;
}

.btn-primary:hover {
  background-color: hsl(170, 65%, 48%);
  box-shadow: 0 4px 10px rgba(44, 201, 172, 0.2);
  transform: translateY(-1px);
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: hsl(215, 20%, 50%);
  gap: 0.75rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid hsl(210, 16%, 90%);
  border-top-color: hsl(170, 75%, 41%);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estado Vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
  border-radius: 12px;
  border: 1px solid hsl(210, 16%, 93%);
  padding: 4rem 1.5rem;
  color: hsl(215, 20%, 45%);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: hsl(215, 60%, 16%);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
  max-width: 380px;
  margin-bottom: 1.5rem;
}
</style>
