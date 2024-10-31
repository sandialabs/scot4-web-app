<template>
 <v-card>
  <template>
  <validation-observer
    ref="observer"
    v-slot="{ invalid }"
  >
    <form @submit.prevent="submit">
      <validation-provider
        v-slot="{ errors }"
        name="splunkHostAddress"
        :rules="{
          required: true,
        }"
      >
        <v-text-field
          v-model="name"
          :error-messages="errors"
          label="Splunk Host Address"
          required
        ></v-text-field>
      </validation-provider>

      <validation-provider
        v-slot="{ errors }"
        name="apiToken"
        rules="required"
      >
        <v-textarea
          v-model="email"
          :error-messages="errors"
          label="Splunk Token"
          required
          filled
        ></v-textarea>

      </validation-provider>

      <v-btn
        class="mr-4"
        type="submit"
        :disabled="invalid"
      >
        submit
      </v-btn>
      <v-btn @click="clear">
        clear
      </v-btn>
    </form>
  </validation-observer>
</template>
 </v-card>
</template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { required, digits, email, max, regex,} from 'vee-validate/dist/rules'
import { extend, ValidationObserver, ValidationProvider, setInteractionMode } from 'vee-validate'

setInteractionMode('eager')

  extend('digits', {
    ...digits,
    message: '{_field_} needs to be {length} digits. ({_value_})',
  })

  extend('required', {
    ...required,
    message: '{_field_} can not be empty',
  })

  extend('max', {
    ...max,
    message: '{_field_} may not be greater than {length} characters',
  })

  extend('regex', {
    ...regex,
    message: '{_field_} {_value_} does not match {regex}',
  })

  extend('email', {
    ...email,
    message: 'Email must be valid',
  })
const namespace: string = 'admin';

@Component({
  components: {
    ValidationProvider,
    ValidationObserver
    },
})
export default class SplunkConfigForm extends Vue{
name = ""
phoneNumber = ""
email = ""
select = null
items: ['1', '2', '3', '4']
checkbox = null

   submit () {
        if (this.$refs.observer)
        1+1
        //this.$refs.observer.validate()
      }


      clear () {
        this.name = ''
        this.phoneNumber = ''
        this.email = ''
        this.select = null
        this.checkbox = null
        //this.$refs.observer.reset()
      }
}
</script>