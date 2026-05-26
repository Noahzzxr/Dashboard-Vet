<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Fecha o menu móvel sempre que a rota mudar
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Obtém a data de hoje formatada por extenso
const getHojeExtenso = () => {
  const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return new Date().toLocaleDateString('pt-BR', opcoes)
}
</script>

<template>
  <div class="app-layout">
    <!-- Hamburguer Menu para telas móveis -->
    <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Menu de Navegação">
      <span class="bar" :class="{ open: mobileMenuOpen }"></span>
      <span class="bar" :class="{ open: mobileMenuOpen }"></span>
      <span class="bar" :class="{ open: mobileMenuOpen }"></span>
    </button>

    <!-- Sidebar Lateral de Navegação -->
    <aside class="app-sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
      <div class="sidebar-brand">
        <span class="brand-logo">🐾</span>
        <div>
          <h2 class="brand-name">VetCare</h2>
          <span class="brand-tagline">Clínica Veterinária</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" exact-active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </router-link>

        <router-link to="/tutores" class="nav-item" active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-label">Tutores</span>
        </router-link>

        <router-link to="/pets" class="nav-item" active-class="active">
          <span class="nav-icon">🐶</span>
          <span class="nav-label">Pets (Pacientes)</span>
        </router-link>

        <router-link to="/veterinarios" class="nav-item" active-class="active">
          <span class="nav-icon">🥼</span>
          <span class="nav-label">Veterinários</span>
        </router-link>

        <router-link to="/consultas" class="nav-item" active-class="active">
          <span class="nav-icon">📅</span>
          <span class="nav-label">Consultas</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-badge">
          <div class="user-avatar">ADM</div>
          <div class="user-info">
            <strong>Administrador</strong>
            <span>Painel Principal</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Backdrop do menu móvel -->
    <div v-if="mobileMenuOpen" class="sidebar-backdrop" @click="toggleMobileMenu"></div>

    <!-- Área de Conteúdo Principal -->
    <div class="app-main-content">
      <!-- Topbar do Aplicativo -->
      <header class="app-topbar">
        <div class="topbar-left">
          <span class="current-route-title">{{ route.meta?.title || 'VetCare Clinic' }}</span>
        </div>
        <div class="topbar-right">
          <span class="current-date">📅 {{ getHojeExtenso() }}</span>
          <div class="clinic-status">
            <span class="status-indicator"></span>
            <span>Clínica Aberta</span>
          </div>
        </div>
      </header>

      <!-- Painel de Visualização com Transição Suave -->
      <main class="app-view-container">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* ======================== SIDEBAR ======================== */
.app-sidebar {
  width: 270px;
  background: linear-gradient(180deg, #1F3C5A 0%, #162d45 100%);
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(31, 60, 90, 0.12);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  padding: 1.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.1);
}

.brand-logo {
  font-size: 2.2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.brand-name {
  font-family: var(--font-title);
  font-weight: 800;
  font-size: 1.5rem;
  line-height: 1.1;
  color: white;
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 0.7rem;
  color: #2BB3A3;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2px;
}

.sidebar-nav {
  padding: 1.25rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.92rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
  color: white;
  transform: translateX(3px);
}

.nav-item.active {
  background: linear-gradient(135deg, #2BB3A3 0%, #239a8c 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(43, 179, 163, 0.35);
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.12);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  background: linear-gradient(135deg, #2BB3A3, #35c9b7);
  color: white;
  font-weight: 700;
  font-size: 0.7rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(43, 179, 163, 0.3);
  letter-spacing: 0.5px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-info strong {
  font-size: 0.85rem;
  color: white;
  font-weight: 600;
}

.user-info span {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
}

/* ================== CONTEÚDO PRINCIPAL ================== */
.app-main-content {
  flex: 1;
  margin-left: 270px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-app);
  width: calc(100% - 270px);
}

/* ======================== TOPBAR ======================== */
.app-topbar {
  background-color: #FFFFFF;
  height: 68px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 90;
  box-shadow: 0 1px 4px rgba(31, 60, 90, 0.03);
}

.current-route-title {
  font-family: var(--font-title);
  font-size: 1.2rem;
  font-weight: 700;
  color: #1F3C5A;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.current-date {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-muted);
}

.clinic-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background-color: #e6f7f5;
  color: #239a8c;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid #c5ede8;
}

.status-indicator {
  width: 7px;
  height: 7px;
  background-color: #2BB3A3;
  border-radius: 50%;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

/* ================= CONTAINER DE VIEWS =================== */
.app-view-container {
  padding: 2rem 2.25rem;
  flex: 1;
  overflow-y: auto;
}

/* =================== MENU MOBILE ======================== */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background-color: #1F3C5A;
  border: none;
  border-radius: var(--radius-sm);
  width: 42px;
  height: 42px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(31, 60, 90, 0.2);
  transition: background-color 0.2s;
}

.mobile-toggle:hover {
  background-color: #2a5078;
}

.mobile-toggle .bar {
  display: block;
  width: 20px;
  height: 2px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-toggle .bar.open:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-toggle .bar.open:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.mobile-toggle .bar.open:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(31, 60, 90, 0.5);
  backdrop-filter: blur(3px);
  z-index: 99;
  animation: backdropIn 0.3s ease;
}

@keyframes backdropIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ================ RESPONSIVIDADE ======================== */
@media (max-width: 992px) {
  .mobile-toggle {
    display: flex;
  }
  
  .app-sidebar {
    transform: translateX(-100%);
  }
  
  .app-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .app-main-content {
    margin-left: 0;
    width: 100%;
  }
  
  .app-topbar {
    padding-left: 4.5rem;
  }

  .app-view-container {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 576px) {
  .current-date {
    display: none;
  }
  
  .app-topbar {
    height: 58px;
  }
  
  .mobile-toggle {
    top: 0.6rem;
    left: 0.6rem;
  }

  .app-view-container {
    padding: 1.25rem 0.75rem;
  }
}
</style>
