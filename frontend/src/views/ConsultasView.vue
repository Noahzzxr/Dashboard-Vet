<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../services/api.js'
import ConsultaForm from '../components/ConsultaForm.vue'

const route = useRoute()

const consultas = ref([])
const pets = ref([])
const veterinarios = ref([])
const searchFilter = ref('')
const statusFilter = ref('') // filtro por status: '' (Todos), 'Agendada', 'Realizada', 'Cancelada'
const showModal = ref(false)
const editingConsulta = ref(null)
const isLoading = ref(true)

// Dicionários para acesso fácil
const petsMap = computed(() => {
  return pets.value.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
})

const vetsMap = computed(() => {
  return veterinarios.value.reduce((acc, v) => ({ ...acc, [v.id]: v }), {})
})

const loadData = async () => {
  try {
    isLoading.value = true
    const [consultasData, petsData, vetsData] = await Promise.all([
      api.getConsultas(),
      api.getPets(),
      api.getVeterinarios()
    ])
    consultas.value = consultasData
    pets.value = petsData
    veterinarios.value = vetsData
  } catch (error) {
    console.error('Erro ao carregar consultas:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData()
  if (route.query.openForm === 'true') {
    openCreateModal()
  }
})

// Filtra consultas por nome de pet, vet ou sintomas + status selecionado
const filteredConsultas = computed(() => {
  let list = consultas.value

  if (statusFilter.value) {
    list = list.filter(c => c.status === statusFilter.value)
  }

  if (searchFilter.value.trim()) {
    const query = searchFilter.value.toLowerCase().trim()
    list = list.filter(c => {
      const petName = petsMap.value[c.petId]?.nome || ''
      const vetName = vetsMap.value[c.veterinarioId]?.nome || ''
      const sintomas = c.sintomas || ''
      
      return petName.toLowerCase().includes(query) || 
             vetName.toLowerCase().includes(query) ||
             sintomas.toLowerCase().includes(query)
    })
  }

  // Ordena por data decrescente e hora decrescente (mais recentes primeiro)
  return list.sort((a, b) => new Date(`${b.data}T${b.hora}`) - new Date(`${a.data}T${a.hora}`))
})

const openCreateModal = () => {
  editingConsulta.value = null
  showModal.value = true
}

const openEditModal = (consulta) => {
  editingConsulta.value = { ...consulta }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingConsulta.value = null
}

const handleSave = async (consultaData) => {
  try {
    if (editingConsulta.value) {
      // Editar
      await api.updateConsulta(editingConsulta.value.id, consultaData)
    } else {
      // Criar
      await api.createConsulta(consultaData)
    }
    await loadData()
    closeModal()
  } catch (error) {
    alert('Erro ao salvar agendamento.')
    console.error(error)
  }
}

const handleDelete = async (id) => {
  if (confirm('Deseja realmente excluir este agendamento?')) {
    try {
      await api.deleteConsulta(id)
      await loadData()
    } catch (error) {
      alert('Erro ao deletar consulta.')
      console.error(error)
    }
  }
}

// Formata data brasileira (DD/MM/AAAA)
const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}

// Retorna classe CSS baseada no status
const getStatusClass = (status) => {
  if (status === 'Realizada') return 'status-badge done'
  if (status === 'Cancelada') return 'status-badge cancelled'
  return 'status-badge scheduled'
}
</script>

<template>
  <div class="consultas-view">
    <!-- Cabeçalho da View -->
    <div class="view-header">
      <div>
        <h1 class="view-title">📅 Agendamentos & Consultas</h1>
        <p class="view-subtitle">Controle a agenda médica, status das consultas, receitas e diagnósticos.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <span class="btn-icon">📅</span> Agendar Atendimento
      </button>
    </div>

    <!-- Barra de Filtros e Busca -->
    <div class="filter-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          v-model="searchFilter" 
          placeholder="Buscar consulta por pet, veterinário ou sintoma..." 
          class="search-input"
        />
      </div>

      <div class="status-filters">
        <button 
          class="filter-tab-btn" 
          :class="{ active: statusFilter === '' }"
          @click="statusFilter = ''"
        >
          Todos
        </button>
        <button 
          class="filter-tab-btn tab-scheduled" 
          :class="{ active: statusFilter === 'Agendada' }"
          @click="statusFilter = 'Agendada'"
        >
          Agendadas
        </button>
        <button 
          class="filter-tab-btn tab-done" 
          :class="{ active: statusFilter === 'Realizada' }"
          @click="statusFilter = 'Realizada'"
        >
          Realizadas
        </button>
        <button 
          class="filter-tab-btn tab-cancelled" 
          :class="{ active: statusFilter === 'Cancelada' }"
          @click="statusFilter = 'Cancelada'"
        >
          Canceladas
        </button>
      </div>

      <span class="results-count">{{ filteredConsultas.length }} consulta(s)</span>
    </div>

    <!-- Indicador de Carregamento -->
    <div v-if="isLoading" class="loader-container">
      <div class="spinner"></div>
      <p>Acessando agenda clínica...</p>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="filteredConsultas.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <h4>Nenhum atendimento cadastrado</h4>
      <p v-if="searchFilter || statusFilter">Não foram encontradas consultas para as opções de filtro marcadas.</p>
      <p v-else>Não há agendamentos agendados no sistema. Comece clicando em Agendar Atendimento.</p>
      <button v-if="!searchFilter && !statusFilter" class="btn btn-primary" @click="openCreateModal">Agendar Agora</button>
    </div>

    <!-- Tabela de Listagem -->
    <div v-else class="table-card">
      <div class="table-responsive">
        <table class="clinic-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Paciente (Pet)</th>
              <th>Veterinário</th>
              <th>Data e Hora</th>
              <th>Sintomas / Motivo</th>
              <th>Diagnóstico / Receita</th>
              <th class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="consulta in filteredConsultas" :key="consulta.id" :class="`row-status-${consulta.status.toLowerCase()}`">
              <td>
                <span :class="getStatusClass(consulta.status)">
                  {{ consulta.status }}
                </span>
              </td>
              <td>
                <div class="patient-cell">
                  <span class="pet-icon">🐾</span>
                  <div class="patient-info">
                    <strong>{{ petsMap[consulta.petId]?.nome || 'Paciente Excluído' }}</strong>
                    <span>{{ petsMap[consulta.petId]?.especie || 'N/A' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="vet-cell">
                  <strong>{{ vetsMap[consulta.veterinarioId]?.nome || 'Vet Excluído' }}</strong>
                  <span>{{ vetsMap[consulta.veterinarioId]?.crmv || 'CRMV N/A' }}</span>
                </div>
              </td>
              <td>
                <div class="date-time-cell">
                  <strong>{{ formatarData(consulta.data) }}</strong>
                  <span>às {{ consulta.hora }}</span>
                </div>
              </td>
              <td class="text-wrap-cell" :title="consulta.sintomas">{{ consulta.sintomas }}</td>
              <td class="text-wrap-cell diagnosis-cell" :title="consulta.diagnostico">
                <span v-if="consulta.diagnostico" class="diagnosis-txt">
                  📝 {{ consulta.diagnostico }}
                </span>
                <span v-else class="no-diagnosis">
                  Pendente de consulta...
                </span>
              </td>
              <td class="text-right actions-cell">
                <button class="btn-action btn-edit" title="Atender / Editar Consulta" @click="openEditModal(consulta)">
                  ✏️
                </button>
                <button class="btn-action btn-delete" title="Excluir Registro" @click="handleDelete(consulta.id)">
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
        <ConsultaForm 
          :consulta="editingConsulta" 
          :pets="pets"
          :veterinarios="veterinarios"
          @save="handleSave" 
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.consultas-view {
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
  max-width: 320px;
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

.status-filters {
  display: flex;
  background-color: hsl(210, 16%, 95%);
  padding: 0.3rem;
  border-radius: 8px;
  gap: 0.2rem;
}

.filter-tab-btn {
  background: none;
  border: none;
  padding: 0.45rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: hsl(215, 20%, 40%);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab-btn:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.filter-tab-btn.active {
  background-color: white;
  color: hsl(215, 60%, 16%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.filter-tab-btn.active.tab-scheduled {
  color: hsl(215, 65%, 45%);
}

.filter-tab-btn.active.tab-done {
  color: hsl(170, 75%, 35%);
}

.filter-tab-btn.active.tab-cancelled {
  color: hsl(354, 70%, 50%);
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
  background-color: hsl(210, 16%, 99%);
}

.row-status-cancelled td {
  background-color: hsla(354, 70%, 98%, 0.5);
}

.patient-cell, .vet-cell {
  display: flex;
  flex-direction: column;
}

.patient-cell {
  position: relative;
  padding-left: 1.5rem;
}

.pet-icon {
  position: absolute;
  left: 0;
  top: 2px;
  font-size: 1rem;
}

.patient-info strong, .vet-cell strong {
  font-size: 0.92rem;
  color: hsl(215, 60%, 16%);
  font-weight: 700;
}

.patient-info span, .vet-cell span {
  font-size: 0.78rem;
  color: hsl(215, 20%, 50%);
}

.date-time-cell {
  display: flex;
  flex-direction: column;
}

.date-time-cell strong {
  color: hsl(215, 60%, 20%);
}

.date-time-cell span {
  font-size: 0.8rem;
  color: hsl(215, 20%, 50%);
}

.text-wrap-cell {
  max-width: 220px;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
}

.diagnosis-cell {
  background-color: hsl(210, 16%, 99%);
  font-style: italic;
  font-size: 0.85rem;
}

.diagnosis-txt {
  color: hsl(215, 40%, 30%);
}

.no-diagnosis {
  color: hsl(215, 10%, 65%);
}

/* Badges de Status */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 750;
  text-align: center;
  border: 1px solid;
}

.status-badge.scheduled {
  background-color: hsl(210, 75%, 95%);
  color: hsl(215, 65%, 45%);
  border-color: hsl(210, 75%, 88%);
}

.status-badge.done {
  background-color: hsl(170, 75%, 95%);
  color: hsl(170, 75%, 32%);
  border-color: hsl(170, 75%, 85%);
}

.status-badge.cancelled {
  background-color: hsl(354, 70%, 96%);
  color: hsl(354, 70%, 50%);
  border-color: hsl(354, 70%, 90%);
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
