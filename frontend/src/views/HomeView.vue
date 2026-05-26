<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api.js'

const router = useRouter()

const metrics = ref({
  tutores: 0,
  pets: 0,
  veterinarios: 0,
  consultas: 0,
  proximas: 0
})

const proxsConsultas = ref([])
const petsMap = ref({})
const vetsMap = ref({})
const isLoading = ref(true)

const loadDashboardData = async () => {
  try {
    isLoading.value = true
    
    // Carrega todos os recursos em paralelo
    const [tutores, pets, vets, consultas] = await Promise.all([
      api.getTutores(),
      api.getPets(),
      api.getVeterinarios(),
      api.getConsultas()
    ])

    // Preenche estatísticas
    metrics.value.tutores = tutores.length
    metrics.value.pets = pets.length
    metrics.value.veterinarios = vets.length
    metrics.value.consultas = consultas.length
    
    // Mapeia IDs para nomes fáceis
    petsMap.value = pets.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
    vetsMap.value = vets.reduce((acc, v) => ({ ...acc, [v.id]: v }), {})

    // Filtra consultas "Agendadas"
    const agendadas = consultas.filter(c => c.status === 'Agendada')
    metrics.value.proximas = agendadas.length

    // Ordena consultas agendadas por data e hora decrescentes/crescentes para mostrar as mais próximas
    proxsConsultas.value = agendadas
      .sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`))
      .slice(0, 5) // mostra apenas as 5 mais próximas

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadDashboardData)

const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// Formata data brasileira (DD/MM/AAAA)
const formatarData = (dataStr) => {
  if (!dataStr) return ''
  const [ano, mes, dia] = dataStr.split('-')
  return `${dia}/${mes}/${ano}`
}
</script>

<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div>
        <h1 class="welcome-title">Olá, Bem-vindo ao VetCare 🐾</h1>
        <p class="welcome-subtitle">Aqui está o resumo clínico e operacional da sua clínica veterinária hoje.</p>
      </div>
      <div class="header-badge">
        <span class="pulse-dot"></span>
        Sistema Online
      </div>
    </div>

    <!-- Indicadores Clínicos (Cards) -->
    <div class="metrics-grid">
      <div class="metric-card card-tutores" @click="navigateTo('tutores')">
        <div class="metric-icon">👥</div>
        <div class="metric-content">
          <span class="metric-label">Tutores Cadastrados</span>
          <h2 class="metric-value">{{ metrics.tutores }}</h2>
        </div>
      </div>

      <div class="metric-card card-pets" @click="navigateTo('pets')">
        <div class="metric-icon">🐶</div>
        <div class="metric-content">
          <span class="metric-label">Pets (Pacientes)</span>
          <h2 class="metric-value">{{ metrics.pets }}</h2>
        </div>
      </div>

      <div class="metric-card card-vets" @click="navigateTo('veterinarios')">
        <div class="metric-icon">🥼</div>
        <div class="metric-content">
          <span class="metric-label">Corpo Veterinário</span>
          <h2 class="metric-value">{{ metrics.veterinarios }}</h2>
        </div>
      </div>

      <div class="metric-card card-consultas" @click="navigateTo('consultas')">
        <div class="metric-icon">📅</div>
        <div class="metric-content">
          <span class="metric-label">Próximas Consultas</span>
          <h2 class="metric-value">{{ metrics.proximas }}</h2>
        </div>
      </div>
    </div>

    <!-- Seção de Ações Rápidas & Próximas Consultas -->
    <div class="dashboard-body">
      <!-- Painel Esquerdo: Próximas Consultas -->
      <div class="panel upcoming-appointments">
        <div class="panel-header">
          <h3 class="panel-title">📅 Próximos Atendimentos da Semana</h3>
          <button class="btn-link" @click="navigateTo('consultas')">Ver todas</button>
        </div>

        <div v-if="isLoading" class="loader-container">
          <div class="spinner"></div>
          <p>Carregando prontuários...</p>
        </div>

        <div v-else-if="proxsConsultas.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <h4>Nenhuma consulta agendada!</h4>
          <p>Tudo tranquilo no momento. Que tal agendar um novo atendimento?</p>
          <button class="btn btn-accent" @click="navigateTo('consultas')">Agendar Agora</button>
        </div>

        <div v-else class="table-responsive">
          <table class="clinic-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Espécie</th>
                <th>Tutor</th>
                <th>Veterinário</th>
                <th>Data / Hora</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="consulta in proxsConsultas" :key="consulta.id">
                <td>
                  <span class="patient-badge">
                    {{ petsMap[consulta.petId]?.nome || 'Desconhecido' }}
                  </span>
                </td>
                <td>{{ petsMap[consulta.petId]?.especie || 'N/A' }}</td>
                <td>
                  <!-- Busca tutor do pet -->
                  {{ petsMap[consulta.petId]?.tutorId ? 'Tutor #' + petsMap[consulta.petId]?.tutorId : 'N/A' }}
                </td>
                <td>
                  <span class="vet-badge">
                    {{ vetsMap[consulta.veterinarioId]?.nome || 'Desconhecido' }}
                  </span>
                </td>
                <td>
                  <div class="date-time-cell">
                    <strong>{{ formatarData(consulta.data) }}</strong>
                    <span>às {{ consulta.hora }}</span>
                  </div>
                </td>
                <td class="truncate-cell" :title="consulta.sintomas">{{ consulta.sintomas }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Painel Direito: Atalhos e Saúde Animal -->
      <div class="panel quick-actions-panel">
        <h3 class="panel-title">⚡ Ações Rápidas</h3>
        <div class="actions-buttons-stack">
          <button class="action-btn" @click="router.push({ name: 'tutores', query: { openForm: 'true' } })">
            <span class="action-icon">➕👤</span>
            <div class="action-info">
              <strong>Cadastrar Tutor</strong>
              <span>Inserir novo proprietário de animal</span>
            </div>
          </button>

          <button class="action-btn" @click="router.push({ name: 'pets', query: { openForm: 'true' } })">
            <span class="action-icon">➕🐶</span>
            <div class="action-info">
              <strong>Cadastrar Novo Pet</strong>
              <span>Vincular novo paciente a um tutor</span>
            </div>
          </button>

          <button class="action-btn" @click="router.push({ name: 'consultas', query: { openForm: 'true' } })">
            <span class="action-icon">📅⏰</span>
            <div class="action-info">
              <strong>Agendar Consulta</strong>
              <span>Marcar dia e horário com veterinário</span>
            </div>
          </button>
        </div>

        <div class="health-tips-card">
          <h4>💡 Dica Clínica do Dia</h4>
          <p>"Mantenha as vacinas V10/V8 e Antirrábica dos cães em dia. A prevenção é a melhor forma de garantir uma vida longa e saudável para o seu melhor amigo!"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 800;
  color: #1F3C5A;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  font-size: 0.92rem;
  color: #4A4A4A;
  margin-top: 0.3rem;
  line-height: 1.5;
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e6f7f5;
  color: #239a8c;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid #c5ede8;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #2BB3A3;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 179, 163, 0.6); }
  70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(43, 179, 163, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(43, 179, 163, 0); }
}

/* Grade de Indicadores */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: #FFFFFF;
  padding: 1.35rem 1.25rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 1.1rem;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.metric-card:hover::before {
  opacity: 1;
}

.card-tutores::before { background: #4a90d9; }
.card-pets::before { background: #2BB3A3; }
.card-vets::before { background: #9b59b6; }
.card-consultas::before { background: #e8a838; }

.metric-icon {
  font-size: 2rem;
  background: var(--bg-app);
  width: 54px;
  height: 54px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.metric-value {
  font-family: var(--font-title);
  font-size: 1.9rem;
  font-weight: 800;
  color: #1F3C5A;
  margin-top: 0.15rem;
  line-height: 1.1;
}

/* Corpo do Dashboard */
.dashboard-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 992px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  border-bottom: 1.5px solid var(--border-light);
  padding-bottom: 0.75rem;
}

.panel-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F3C5A;
}

.btn-link {
  background: none;
  border: none;
  color: #2BB3A3;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.btn-link:hover {
  color: #239a8c;
  text-decoration: underline;
}

/* Loader */
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: var(--text-muted);
  gap: 0.75rem;
}

.spinner {
  width: 38px;
  height: 38px;
  border: 3px solid var(--border-color);
  border-top-color: #2BB3A3;
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
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
  padding: 3rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.empty-state h4 {
  color: #1F3C5A;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.empty-state p {
  font-size: 0.88rem;
  max-width: 320px;
  margin-bottom: 1.25rem;
  color: #4A4A4A;
}

.btn-accent {
  background: linear-gradient(135deg, #2BB3A3, #35c9b7);
  color: white;
  border: none;
  padding: 0.65rem 1.35rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: var(--shadow-accent);
}

.btn-accent:hover {
  background: linear-gradient(135deg, #35c9b7, #2BB3A3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(43, 179, 163, 0.3);
}

/* Tabela Clínica */
.table-responsive {
  overflow-x: auto;
}

.clinic-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.clinic-table th {
  padding: 0.8rem 1rem;
  font-weight: 600;
  color: var(--text-muted);
  background-color: var(--bg-app);
  border-bottom: 2px solid var(--border-color);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.clinic-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-light);
  color: #4A4A4A;
}

.clinic-table tbody tr {
  transition: background-color 0.15s;
}

.clinic-table tbody tr:hover {
  background-color: #fafcfc;
}

.patient-badge {
  background-color: #e6f7f5;
  color: #239a8c;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.82rem;
  display: inline-block;
}

.vet-badge {
  background-color: var(--bg-app);
  color: #1F3C5A;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.82rem;
  display: inline-block;
}

.date-time-cell {
  display: flex;
  flex-direction: column;
}

.date-time-cell strong {
  color: #1F3C5A;
  font-size: 0.88rem;
}

.date-time-cell span {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.truncate-cell {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Painel de Atalhos */
.quick-actions-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.actions-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--bg-app);
  border: 1px solid var(--border-color);
  padding: 0.9rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: #FFFFFF;
  border-color: #2BB3A3;
  box-shadow: 0 4px 12px rgba(43, 179, 163, 0.12);
  transform: translateX(4px);
}

.action-icon {
  font-size: 1.4rem;
}

.action-info {
  display: flex;
  flex-direction: column;
}

.action-info strong {
  font-size: 0.9rem;
  color: #1F3C5A;
  font-weight: 700;
}

.action-info span {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

.health-tips-card {
  background: linear-gradient(135deg, #1F3C5A 0%, #2a5078 100%);
  color: white;
  padding: 1.35rem;
  border-radius: var(--radius-md);
  margin-top: auto;
  box-shadow: 0 4px 16px rgba(31, 60, 90, 0.15);
}

.health-tips-card h4 {
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #2BB3A3;
}

.health-tips-card p {
  font-size: 0.82rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.8);
}
</style>
