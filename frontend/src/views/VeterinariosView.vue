<script setup>
import { ref, onMounted, computed } from 'vue'
import { api } from '../services/api.js'
import VeterinarioForm from '../components/VeterinarioForm.vue'

const veterinarios = ref([])
const searchFilter = ref('')
const showModal = ref(false)
const editingVet = ref(null)
const isLoading = ref(true)

const loadVeterinarios = async () => {
  try {
    isLoading.value = true
    veterinarios.value = await api.getVeterinarios()
  } catch (error) {
    console.error('Erro ao carregar veterinários:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadVeterinarios)

const filteredVeterinarios = computed(() => {
  if (!searchFilter.value.trim()) return veterinarios.value
  const query = searchFilter.value.toLowerCase().trim()
  return veterinarios.value.filter(v => 
    v.nome.toLowerCase().includes(query) || 
    v.crmv.toLowerCase().includes(query) ||
    v.especialidade.toLowerCase().includes(query)
  )
})

const openCreateModal = () => {
  editingVet.value = null
  showModal.value = true
}

const openEditModal = (vet) => {
  editingVet.value = { ...vet }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingVet.value = null
}

const handleSave = async (vetData) => {
  try {
    if (editingVet.value) {
      // Editar
      await api.updateVeterinario(editingVet.value.id, vetData)
    } else {
      // Criar
      await api.createVeterinario(vetData)
    }
    await loadVeterinarios()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar veterinário.')
    console.error(error)
  }
}

const handleDelete = async (id) => {
  if (confirm('Deseja realmente excluir este veterinário?')) {
    try {
      await api.deleteVeterinario(id)
      await loadVeterinarios()
    } catch (error) {
      alert('Erro ao deletar veterinário.')
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="veterinarios-view">
    <!-- Cabeçalho da View -->
    <div class="view-header">
      <div>
        <h1 class="view-title">🥼 Corpo Clínico Veterinário</h1>
        <p class="view-subtitle">Gerencie os profissionais de saúde, registros de CRMV e especialidades médicas.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span class="btn-icon">➕</span> Novo Veterinário
      </button>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchFilter" 
          placeholder="Buscar por nome, CRMV ou especialidade..." 
          class="search-input"
        />
      </div>
      <span class="results-count">{{ filteredVeterinarios.length }} especialista(s)</span>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="isLoading" class="loader-container">
      <div class="spinner"></div>
      <p>Consultando lista profissional...</p>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="filteredVeterinarios.length === 0" class="empty-state">
      <div class="empty-icon">🥼</div>
      <h4>Nenhum veterinário encontrado</h4>
      <p v-if="searchFilter">Nenhum médico veterinário atende aos critérios de pesquisa.</p>
      <p v-else>Não há veterinários cadastrados no sistema.</p>
      <button v-if="!searchFilter" class="btn btn-primary" @click="openCreateModal">Cadastrar Veterinário</button>
    </div>

    <!-- Grid de Especialistas -->
    <div v-else class="vets-grid">
      <div v-for="vet in filteredVeterinarios" :key="vet.id" class="vet-card">
        <div class="vet-card-header">
          <span class="vet-avatar">🥼</span>
          <div class="vet-badge-tag">{{ vet.especialidade }}</div>
        </div>

        <div class="vet-card-body">
          <h3 class="vet-name">{{ vet.nome }}</h3>
          <span class="vet-crmv">{{ vet.crmv }}</span>

          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-icon">📞</span>
              <span>{{ vet.telefone }}</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">✉️</span>
              <span class="email-text" :title="vet.email">{{ vet.email }}</span>
            </div>
          </div>
        </div>

        <div class="vet-card-actions">
          <button class="btn btn-secondary btn-sm" @click="openEditModal(vet)">✏️ Editar</button>
          <button class="btn btn-danger-outline btn-sm" @click="handleDelete(vet.id)">🗑️ Excluir</button>
        </div>
      </div>
    </div>

    <!-- Modal de Formulário -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close-btn" @click="closeModal">&times;</button>
        <VeterinarioForm 
          :veterinario="editingVet" 
          @save="handleSave" 
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.veterinarios-view {
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

/* Grid de Veterinários */
.vets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.vet-card {
  background: white;
  border-radius: 14px;
  border: 1px solid hsl(210, 16%, 92%);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
}

.vet-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  border-color: hsl(170, 75%, 82%);
}

.vet-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.vet-avatar {
  font-size: 1.6rem;
  background-color: hsl(210, 16%, 94%);
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vet-badge-tag {
  background-color: hsl(170, 75%, 95%);
  color: hsl(170, 75%, 35%);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid hsl(170, 75%, 90%);
}

.vet-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.vet-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: hsl(215, 60%, 16%);
}

.vet-crmv {
  font-size: 0.8rem;
  color: hsl(215, 20%, 50%);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background-color: hsl(210, 16%, 98%);
  padding: 0.6rem;
  border-radius: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: hsl(215, 30%, 35%);
}

.contact-icon {
  font-size: 0.9rem;
}

.email-text {
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vet-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  border-top: 1px solid hsl(210, 16%, 94%);
  padding-top: 0.75rem;
}

.vet-card-actions .btn {
  flex: 1;
  justify-content: center;
  padding: 0.45rem 0;
  font-size: 0.85rem;
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

.btn-secondary {
  background-color: hsl(210, 16%, 93%);
  color: hsl(215, 40%, 25%);
}

.btn-secondary:hover {
  background-color: hsl(210, 16%, 87%);
}

.btn-danger-outline {
  background: none;
  border: 1px solid hsl(354, 70%, 85%);
  color: hsl(354, 70%, 50%);
}

.btn-danger-outline:hover {
  background-color: hsl(354, 70%, 96%);
  border-color: hsl(354, 70%, 54%);
}

.btn-sm {
  border-radius: 6px;
  font-weight: 600;
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
