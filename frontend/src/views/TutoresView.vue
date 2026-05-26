<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api.js'
import TutorForm from '../components/TutorForm.vue'

const route = useRoute()

const tutores = ref([])
const searchFilter = ref('')
const showModal = ref(false)
const editingTutor = ref(null)
const isLoading = ref(true)

const loadTutores = async () => {
  try {
    isLoading.value = true
    tutores.value = await api.getTutores()
  } catch (error) {
    console.error('Erro ao carregar tutores:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadTutores()
  // Verifica se o redirecionamento pediu para abrir o formulário
  if (route.query.openForm === 'true') {
    openCreateModal()
  }
})

// Filtra dinamicamente tutores por nome ou CPF
const filteredTutores = computed(() => {
  if (!searchFilter.value.trim()) return tutores.value
  const query = searchFilter.value.toLowerCase().trim()
  return tutores.value.filter(t => 
    t.nome.toLowerCase().includes(query) || 
    (t.cpf || '').includes(query)
  )
})

const openCreateModal = () => {
  editingTutor.value = null
  showModal.value = true
}

const openEditModal = (tutor) => {
  editingTutor.value = { ...tutor }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTutor.value = null
}

const handleSave = async (tutorData) => {
  try {
    if (editingTutor.value) {
      // Editar
      await api.updateTutor(editingTutor.value.id, tutorData)
    } else {
      // Criar
      await api.createTutor(tutorData)
    }
    await loadTutores()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar tutor. Detalhes no console.')
    console.error(error)
  }
}

const handleDelete = async (id) => {
  if (confirm('Deseja realmente excluir este tutor? Atenção: isso poderá impactar os pets vinculados.')) {
    try {
      await api.deleteTutor(id)
      await loadTutores()
    } catch (error) {
      alert('Erro ao deletar tutor.')
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="tutores-view">
    <!-- Cabeçalho da View -->
    <div class="view-header">
      <div>
        <h1 class="view-title">👥 Gerenciamento de Tutores</h1>
        <p class="view-subtitle">Cadastre, edite e acompanhe os responsáveis pelos pets da clínica.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span class="btn-icon">➕</span> Novo Tutor
      </button>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchFilter" 
          placeholder="Buscar tutor por nome ou CPF..." 
          class="search-input"
        />
      </div>
      <span class="results-count">{{ filteredTutores.length }} tutor(es) encontrado(s)</span>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="isLoading" class="loader-container">
      <div class="spinner"></div>
      <p>Buscando tutores...</p>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="filteredTutores.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h4>Nenhum tutor encontrado</h4>
      <p v-if="searchFilter">Sua busca não retornou resultados. Tente outros termos.</p>
      <p v-else>Não há tutores cadastrados no sistema. Comece cadastrando um novo!</p>
      <button v-if="!searchFilter" class="btn btn-primary" @click="openCreateModal">Cadastrar Tutor</button>
    </div>

    <!-- Tabela de Listagem -->
    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome Completo</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Endereço</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tutor in filteredTutores" :key="tutor.id">
              <td><strong>#{{ tutor.id }}</strong></td>
              <td>
                <div class="tutor-name-cell">
                  <span class="avatar-sym">👤</span>
                  <strong>{{ tutor.nome }}</strong>
                </div>
              </td>
              <td>{{ tutor.cpf || 'Não informado' }}</td>
              <td>{{ tutor.telefone }}</td>
              <td>{{ tutor.email }}</td>
              <td class="address-cell" :title="tutor.endereco">{{ tutor.endereco }}</td>
              <td class="text-right actions-cell">
                <button class="btn-action btn-edit" title="Editar" @click="openEditModal(tutor)">
                  ✏️
                </button>
                <button class="btn-action btn-delete" title="Excluir" @click="handleDelete(tutor.id)">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close-btn" @click="closeModal">&times;</button>
        <TutorForm 
          :tutor="editingTutor" 
          @save="handleSave" 
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutores-view {
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

/* Tabela e Cartão */
.table-card {
  background: white;
  border-radius: 12px;
  border: 1px solid hsl(210, 16%, 93%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.clinic-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.clinic-table th {
  padding: 0.9rem 1.1rem;
  font-weight: 650;
  color: hsl(215, 30%, 40%);
  background-color: hsl(210, 16%, 97%);
  border-bottom: 2px solid hsl(210, 16%, 91%);
}

.clinic-table td {
  padding: 1rem 1.1rem;
  border-bottom: 1px solid hsl(210, 16%, 94%);
  color: hsl(215, 45%, 20%);
  vertical-align: middle;
}

.clinic-table tbody tr:hover {
  background-color: hsl(210, 16%, 98%);
}

.tutor-name-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.avatar-sym {
  font-size: 1.2rem;
  background-color: hsl(210, 16%, 93%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-right {
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-action {
  background: hsl(210, 16%, 95%);
  border: 1px solid hsl(210, 16%, 90%);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-action:hover {
  transform: translateY(-1px);
}

.btn-edit:hover {
  background-color: hsl(170, 75%, 95%);
  border-color: hsl(170, 75%, 80%);
}

.btn-delete:hover {
  background-color: hsl(354, 70%, 95%);
  border-color: hsl(354, 70%, 85%);
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
