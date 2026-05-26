<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  veterinario: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  nome: '',
  crmv: '',
  especialidade: '',
  telefone: '',
  email: ''
})

const errors = ref({})

const syncForm = () => {
  if (props.veterinario) {
    formData.value = { ...props.veterinario }
  } else {
    formData.value = {
      nome: '',
      crmv: '',
      especialidade: '',
      telefone: '',
      email: ''
    }
  }
  errors.value = {}
}

watch(() => props.veterinario, syncForm, { deep: true })
onMounted(syncForm)

// Formata CRMV automaticamente
const formatCRMV = (e) => {
  let value = e.target.value.toUpperCase()
  // Permite letras e números e hífen, limitando tamanho
  formData.value.crmv = value
}

// Formata Telefone automaticamente ((##) #####-####)
const formatTelefone = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)
  
  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2')
  }
  formData.value.telefone = value
}

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.nome.trim()) {
    errors.value.nome = 'Nome do veterinário é obrigatório.'
    isValid = false
  }
  if (!formData.value.crmv.trim()) {
    errors.value.crmv = 'CRMV é obrigatório (ex: CRMV-SP 12345).'
    isValid = false
  }
  if (!formData.value.especialidade) {
    errors.value.especialidade = 'Selecione uma especialidade.'
    isValid = false
  }
  if (!formData.value.telefone.trim() || formData.value.telefone.length < 14) {
    errors.value.telefone = 'Telefone inválido.'
    isValid = false
  }
  if (!formData.value.email.trim() || !formData.value.email.includes('@')) {
    errors.value.email = 'E-mail inválido.'
    isValid = false
  }

  return isValid
}

const submitForm = () => {
  if (validate()) {
    emit('save', { ...formData.value })
  }
}
</script>

<template>
  <div class="form-container">
    <h3 class="form-title">{{ veterinario ? 'Editar Veterinário' : 'Novo Veterinário' }}</h3>
    
    <form @submit.prevent="submitForm" class="clinic-form">
      <div class="form-group">
        <label for="nome">Nome Completo <span class="required">*</span></label>
        <input 
          type="text" 
          id="nome" 
          v-model="formData.nome" 
          placeholder="Ex: Dra. Ana Beatriz"
          :class="{ 'has-error': errors.nome }"
        />
        <span v-if="errors.nome" class="error-msg">{{ errors.nome }}</span>
      </div>

      <div class="form-row">
        <div class="form-group col-6">
          <label for="crmv">CRMV <span class="required">*</span></label>
          <input 
            type="text" 
            id="crmv" 
            :value="formData.crmv"
            @input="formatCRMV"
            placeholder="Ex: CRMV-SP 12345"
            :class="{ 'has-error': errors.crmv }"
          />
          <span v-if="errors.crmv" class="error-msg">{{ errors.crmv }}</span>
        </div>

        <div class="form-group col-6">
          <label for="especialidade">Especialidade <span class="required">*</span></label>
          <select 
            id="especialidade" 
            v-model="formData.especialidade"
            :class="{ 'has-error': errors.especialidade }"
          >
            <option value="" disabled>Selecione...</option>
            <option value="Clínica Geral">Clínica Geral</option>
            <option value="Cirurgia Geral">Cirurgia Geral</option>
            <option value="Dermatologia">Dermatologia</option>
            <option value="Cardiologia">Cardiologia</option>
            <option value="Ortopedia">Ortopedia</option>
            <option value="Animais Silvestres">Animais Silvestres</option>
            <option value="Outro">Outro</option>
          </select>
          <span v-if="errors.especialidade" class="error-msg">{{ errors.especialidade }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-6">
          <label for="telefone">Telefone <span class="required">*</span></label>
          <input 
            type="text" 
            id="telefone" 
            :value="formData.telefone"
            @input="formatTelefone"
            placeholder="(00) 00000-0000"
            :class="{ 'has-error': errors.telefone }"
          />
          <span v-if="errors.telefone" class="error-msg">{{ errors.telefone }}</span>
        </div>

        <div class="form-group col-6">
          <label for="email">E-mail <span class="required">*</span></label>
          <input 
            type="email" 
            id="email" 
            v-model="formData.email" 
            placeholder="nome@vetcare.com"
            :class="{ 'has-error': errors.email }"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar Veterinário</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
}

.form-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: hsl(215, 60%, 16%);
  margin-bottom: 1.25rem;
  border-bottom: 2px solid hsl(210, 16%, 93%);
  padding-bottom: 0.5rem;
}

.clinic-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.col-6 {
  flex: 1;
}

label {
  font-size: 0.9rem;
  font-weight: 550;
  color: hsl(215, 40%, 25%);
}

.required {
  color: hsl(354, 70%, 54%);
}

input, select {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid hsl(210, 16%, 85%);
  border-radius: 8px;
  font-size: 0.95rem;
  color: hsl(215, 60%, 16%);
  background-color: hsl(210, 20%, 99%);
  transition: all 0.3s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: hsl(170, 75%, 41%);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(44, 201, 172, 0.15);
}

input.has-error, select.has-error {
  border-color: hsl(354, 70%, 54%);
}

.error-msg {
  color: hsl(354, 70%, 54%);
  font-size: 0.8rem;
  margin-top: 0.1rem;
  font-weight: 550;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid hsl(210, 16%, 93%);
}

.btn {
  padding: 0.7rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
}

.btn-secondary {
  background-color: hsl(210, 16%, 93%);
  color: hsl(215, 40%, 25%);
}

.btn-secondary:hover {
  background-color: hsl(210, 16%, 88%);
}

.btn-primary {
  background-color: hsl(170, 75%, 41%);
  color: white;
}

.btn-primary:hover {
  background-color: hsl(170, 65%, 48%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(44, 201, 172, 0.2);
}
</style>
