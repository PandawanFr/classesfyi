<template>
  <div class="container">
    <button v-if="state === 'initial'" @click="register" class="button">
      {{ buttonText }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="state === 'loading'">Loading...</div>
    <div v-if="state === 'success'" class="success">
      Successfully registered for updates.
    </div>
  </div>
</template>

<script lang="ts">
import { userStore } from "/@/stores/user";
import { computed, defineComponent, PropType, ref } from "vue";
import { ClassInfo } from "/@/utilities/openCourseApi";
import { getOrFetchTerm } from "/@/stores/term";
import fire from "/@/utilities/fire";
import firebase from "firebase/app";

export default defineComponent({
  name: "RegisterButton",
  props: {
    classInfo: {
      type: Object as PropType<ClassInfo>,
      required: true,
    },
    preRegister: {
      type: Boolean as PropType<Boolean>,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const buttonText = computed<string>(() =>
      props.preRegister === true
        ? "Pre-Register for Updates"
        : "Register for Updates"
    );
    const state = ref<"initial" | "loading" | "success" | "error">("initial");
    const error = ref<string | null>(null);

    const register = async () => {
      if (userStore.state.isSignedIn === false) {
        error.value = "Could not register for class, please sign in.";
        return;
      }
      error.value = null;
      state.value = "loading";

      const { year, term } = await getOrFetchTerm(props.classInfo.campus);

      try {
        const userDoc = await fire
          .firestore()
          .collection("users")
          .doc(userStore.state.email);

        // If user already exists, update with an array union (append element to array)
        if ((await userDoc.get()).exists) {
          await userDoc.update({
            registered_classes: firebase.firestore.FieldValue.arrayUnion({
              campus: props.classInfo.campus,
              year,
              term,
              crn: props.classInfo.CRN,
            }),
          });
        } else {
          // If user does not exist, set registered class with the new one
          await userDoc.set({
            registered_classes: [
              {
                campus: props.classInfo.campus,
                year,
                term,
                crn: props.classInfo.CRN,
              },
            ],
          });
        }
      } catch (err) {
        state.value = "initial";
        error.value = `Something went wrong, please try again. ${err.toString()}`;
      }

      state.value = "success";
    };

    return { state, error, register, buttonText };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>
