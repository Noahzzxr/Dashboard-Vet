<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  pet: {
    type: Object,
    default: null
  },
  tutores: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const formData = ref({
  nome: '',
  especie: '',
  raca: '',
  idadeAnos: 0,
  idadeMeses: 0,
  tutorId: '',
  peso: '',
  observacoes: ''
})

const errors = ref({})

const syncForm = () => {
  if (props.pet) {
    formData.value = { ...props.pet }
  } else {
    formData.value = {
      nome: '',
      especie: '',
      raca: '',
      idadeAnos: 0,
      idadeMeses: 0,
      tutorId: '',
      peso: '',
      observacoes: ''
    }
  }
  errors.value = {}
}

watch(() => props.pet, syncForm, { deep: true })
onMounted(syncForm)

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.nome.trim()) {
    errors.value.nome = 'Nome do pet é obrigatório.'
    isValid = false
  }
  if (!formData.value.especie) {
    errors.value.especie = 'Selecione a espécie.'
    isValid = false
  }
  if (!formData.value.raca.trim()) {
    errors.value.raca = 'Raça é obrigatória (use "MDR" ou "Vira-lata" se indefinida).'
    isValid = false
  }
  if (formData.value.idadeAnos < 0 || formData.value.idadeMeses < 0 || formData.value.idadeMeses > 11) {
    errors.value.idade = 'Idade inválida.'
    isValid = false
  }
  if (!formData.value.tutorId) {
    errors.value.tutorId = 'Selecione o tutor responsável.'
    isValid = false
  }
  if (formData.value.peso === '' || isNaN(formData.value.peso) || Number(formData.value.peso) <= 0) {
    errors.value.peso = 'Insira um peso válido em kg.'
    isValid = false
  }

  return isValid
}

const submitForm = () => {
  if (validate()) {
    // Garante conversão numérica correta dos campos
    const submittedData = {
      ...formData.value,
      tutorId: Number(formData.value.tutorId),
      idadeAnos: Number(formData.value.idadeAnos),
      idadeMeses: Number(formData.value.idadeMeses),
      peso: Number(formData.value.peso)
    }
    emit('save', submittedData)
  }
}
</script>

<template>
  <div class="form-container">
    <h3 class="form-title">{{ pet ? 'Editar Pet' : 'Novo Pet' }}</h3>
    
    <form @submit.prevent="submitForm" class="clinic-form">
      <div class="form-row">
        <div class="form-group col-8">
          <label for="nome">Nome do Pet <span class="required">*</span></label>
          <input 
            type="text" 
            id="nome" 
            v-model="formData.nome" 
            placeholder="Ex: Rex, Mel, Pipoca"
            :class="{ 'has-error': errors.nome }"
          />
          <span v-if="errors.nome" class="error-msg">{{ errors.nome }}</span>
        </div>

        <div class="form-group col-4">
          <label for="especie">Espécie <span class="required">*</span></label>
          <select 
            id="especie" 
            v-model="formData.especie"
            :class="{ 'has-error': errors.especie }"
          >
            <option value="" disabled>Selecione...</option>
            <option value="Cão">Cão (Cachorro)</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave (Calopsita, Papagaio, etc.)</option>
            <option value="Roedor">Roedor (Hámster, Coelho, etc.)</option>
            <option value="Réptil">Réptil</option>
            <option value="Outro">Outro</option>
          </select>
          <span v-if="errors.especie" class="error-msg">{{ errors.especie }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-6">
          <label for="raca">Raça <span class="required">*</span></label>
          <input 
            type="text" 
            id="raca" 
            v-model="formData.raca" 
            placeholder="Ex: Labrador, Siamês, SRD"
            :class="{ 'has-error': errors.raca }"
          />
          <span v-if="errors.raca" class="error-msg">{{ errors.raca }}</span>
        </div>

        <div class="form-group col-6">
          <label for="peso">Peso (kg) <span class="required">*</span></label>
          <input 
            type="number" 
            step="0.01" 
            id="peso" 
            v-model="formData.peso" 
            placeholder="Ex: 12.5"
            :class="{ 'has-error': errors.peso }"
          />
          <span v-if="errors.peso" class="error-msg">{{ errors.peso }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group col-6">
          <label>Idade <span class="required">*</span></label>
          <div class="age-inputs">
            <div class="age-field">
              <input type="number" min="0" max="30" v-model="formData.idadeAnos" />
              <span>Anos</span>
            </div>
            <div class="age-field">
              <input type="number" min="0" max="11" v-model="formData.idadeMeses" />
              <span>Meses</span>
            </div>
          </div>
          <span v-if="errors.idade" class="error-msg">{{ errors.idade }}</span>
        </div>

        <div class="form-group col-6">
          <label for="tutor">Tutor Responsável <span class="required">*</span></label>
          <select 
            id="tutor" 
            v-model="formData.tutorId"
            :class="{ 'has-error': errors.tutorId }"
          >
            <option value="" disabled>Selecione um Tutor...</option>
            <option v-for="tutor in tutores" :key="tutor.id" :value="tutor.id">
              {{ tutor.nome }} ({{ tutor.cpf }})
            </option>
          </select>
          <span v-if="errors.tutorId" class="error-msg">{{ errors.tutorId }}</span>
          <span v-if="tutores.length === 0" class="warning-msg">
            Nenhum tutor cadastrado. Cadastre um tutor primeiro!
          </span>
        </div>
      </div>

      <div class="form-group">
        <label for="observacoes">Observações Médicas / Alergias</label>
        <textarea 
          id="observacoes" 
          v-model="formData.observacoes" 
          placeholder="Ex: Alérgico a penicilina, possui cardiopatia leve, etc."
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
        <button type="submit" class="btn btn-primary" :disabled="tutores.length === 0">Salvar Pet</button>
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

.col-8 { flex: 2; }
.col-4 { flex: 1; }
.col-6 { flex: 1; }

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

input.has-error, select.has-error {
  border-color: hsl(354, 70%, 54%);
}

.age-inputs {
  display: flex;
  gap: 0.75rem;
}

.age-field {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex: 1;
}

.age-field input {
  width: 100%;
}

.age-field span {
  font-size: 0.8rem;
  color: hsl(215, 20%, 45%);
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
