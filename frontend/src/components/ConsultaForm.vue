<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  consulta: {
    type: Object,
    default: null
  },
  pets: {
    type: Array,
    required: true
  },
  veterinarios: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  petId: '',
  veterinarioId: '',
  data: '',
  hora: '',
  sintomas: '',
  diagnostico: '',
  status: 'Agendada'
})

const errors = ref({})

const syncForm = () => {
  if (props.consulta) {
    formData.value = { ...props.consulta }
  } else {
    // Define a data padrão de hoje para conveniência do usuário
    const hoje = new Date().toISOString().split('T')[0]
    formData.value = {
      petId: '',
      veterinarioId: '',
      data: hoje,
      hora: '',
      sintomas: '',
      diagnostico: '',
      status: 'Agendada'
    }
  }
  errors.value = {}
}

watch(() => props.consulta, syncForm, { deep: true })
onMounted(syncForm)

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.petId) {
    errors.value.petId = 'Selecione o pet.'
    isValid = false
  }
  if (!formData.value.veterinarioId) {
    errors.value.veterinarioId = 'Selecione o veterinário.'
    isValid = false
  }
  if (!formData.value.data) {
    errors.value.data = 'Data é obrigatória.'
    isValid = false
  }
  if (!formData.value.hora) {
    errors.value.hora = 'Horário é obrigatório.'
    isValid = false
  }
  if (!formData.value.sintomas.trim()) {
    errors.value.sintomas = 'O motivo do atendimento ou os sintomas são obrigatórios.'
    isValid = false
  }

  return isValid
}

const submitForm = () => {
  if (validate()) {
    emit('save', {
      ...formData.value,
      petId: Number(formData.value.petId),
      veterinarioId: Number(formData.value.veterinarioId)
    })
  }
}
</script>

<template>
  <div class="form-container">
    <h3 class="form-title">{{ consulta ? 'Editar Consulta' : 'Novo Agendamento' }}</h3>
    
    <form @submit.prevent="submitForm" class="clinic-form">
      <div class="form-row">
        <div class="form-group col-6">
          <label for="pet">Pet Paciente <span class="required">*</span></label>
          <select 
            id="pet" 
            v-model="formData.petId"
            :class="{ 'has-error': errors.petId }"
          >
            <option value="" disabled>Selecione um Pet...</option>
            <option v-for="pet in pets" :key="pet.id" :value="pet.id">
              {{ pet.nome }} ({{ pet.especie }} - {{ pet.raca }})
            </option>
          </select>
          <span v-if="errors.petId" class="error-msg">{{ errors.petId }}</span>
          <span v-if="pets.length === 0" class="warning-msg">
            Nenhum pet cadastrado. Cadastre um pet primeiro!
          </span>
        </div>

        <div class="form-group col-6">
          <label for="veterinario">Veterinário Responsável <span class="required">*</span></label>
          <select 
            id="veterinario" 
            v-model="formData.veterinarioId"
            :class="{ 'has-error': errors.veterinarioId }"
          >
            <option value="" disabled>Selecione um Veterinário...</option>
            <option v-for="vet in veterinarios" :key="vet.id" :value="vet.id">
              {{ vet.nome }} ({{ vet.especialidade }})
            </option>
          </select>
          <span v-if="errors.veterinarioId" class="error-msg">{{ errors.veterinarioId }}</span>
          <span v-if="veterinarios.length === 0" class="warning-msg">
            Nenhum veterinário cadastrado. Cadastre um veterinário primeiro!
          </span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-6">
          <label for="data">Data da Consulta <span class="required">*</span></label>
          <input 
            type="date" 
            id="data" 
            v-model="formData.data"
            :class="{ 'has-error': errors.data }"
          />
          <span v-if="errors.data" class="error-msg">{{ errors.data }}</span>
        </div>

        <div class="form-group col-6">
          <label for="hora">Horário <span class="required">*</span></label>
          <input 
            type="time" 
            id="hora" 
            v-model="formData.hora"
            :class="{ 'has-error': errors.hora }"
          />
          <span v-if="errors.hora" class="error-msg">{{ errors.hora }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="sintomas">Motivo da Consulta / Queixas e Sintomas <span class="required">*</span></label>
        <textarea 
          id="sintomas" 
          v-model="formData.sintomas" 
          placeholder="Ex: Vômito há 2 dias, consulta de vacinação, check-up anual, claudicação na pata traseira..."
          rows="3"
          :class="{ 'has-error': errors.sintomas }"
        ></textarea>
        <span v-if="errors.sintomas" class="error-msg">{{ errors.sintomas }}</span>
      </div>

      <div class="form-group" v-if="consulta">
        <label for="diagnostico">Diagnóstico / Prescrição Médica</label>
        <textarea 
          id="diagnostico" 
          v-model="formData.diagnostico" 
          placeholder="Preencher após ou durante a consulta clínica..."
          rows="3"
        ></textarea>
      </div>

      <div class="form-row" v-if="consulta">
        <div class="form-group col-12">
          <label for="status">Status da Consulta</label>
          <div class="status-options">
            <label class="status-option option-scheduled">
              <input type="radio" v-model="formData.status" value="Agendada" />
              <span>Agendada</span>
            </label>
            <label class="status-option option-done">
              <input type="radio" v-model="formData.status" value="Realizada" />
              <span>Realizada</span>
            </label>
            <label class="status-option option-cancelled">
              <input type="radio" v-model="formData.status" value="Cancelada" />
              <span>Cancelada</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="pets.length === 0 || veterinarios.length === 0">
          {{ consulta ? 'Salvar Alterações' : 'Confirmar Agendamento' }}
        </button>
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

.col-12 {
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

input, select, textarea {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid hsl(210, 16%, 85%);
  border-radius: 8px;
  font-size: 0.95rem;
  color: hsl(215, 60%, 16%);
  background-color: hsl(210, 20%, 99%);
  transition: all 0.3s ease;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: hsl(170, 75%, 41%);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(44, 201, 172, 0.15);
}

input.has-error, select.has-error, textarea.has-error {
  border-color: hsl(354, 70%, 54%);
}

.error-msg {
  color: hsl(354, 70%, 54%);
  font-size: 0.8rem;
  margin-top: 0.1rem;
  font-weight: 550;
}

.warning-msg {
  color: hsl(35, 85%, 45%);
  font-size: 0.8rem;
  margin-top: 0.2rem;
  font-weight: 550;
}

.status-options {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.4rem;
  background-color: hsl(210, 16%, 97%);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid hsl(210, 16%, 92%);
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}

.status-option input {
  cursor: pointer;
  accent-color: hsl(170, 75%, 41%);
}

.option-scheduled { color: hsl(215, 50%, 40%); }
.option-done { color: hsl(170, 75%, 35%); }
.option-cancelled { color: hsl(354, 70%, 50%); }

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

.btn:disabled {
  background-color: hsl(210, 16%, 90%);
  color: hsl(210, 10%, 65%);
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-secondary {
  background-color: hsl(210, 16%, 93%);
  color: hsl(215, 40%, 25%);
}

.btn-secondary:hover:not(:disabled) {
  background-color: hsl(210, 16%, 88%);
}

.btn-primary {
  background-color: hsl(170, 75%, 41%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: hsl(170, 65%, 48%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(44, 201, 172, 0.2);
}
</style>
