<script setup>
// Los datos que esperamos recibir del elemento padre (PantallaSalas.vue):
const props = defineProps({
  jugador: {
    type: Object,

    // Valores por defecto si queremos implementar un modo invitado o gost
    default: () => ({
      id: "N/A",
      username: "Invitado",
      avatar: null,
    }),
  },
});

//Emits al padre (PantallaSalas.vue):
const emit = defineEmits(["ver-perfil"]);
</script>

<template>
  <button
    id="btn-message"
    class="button-message"
    @click="$emit('ver-perfil')"
    :disabled="!jugador"
  >
    <div class="content-avatar">
      <div class="status-user"></div>
      <div class="avatar">
        <img
          v-if="jugador && jugador.avatar"
          :src="jugador.avatar"
          alt="Avatar"
          class="user-img"
        />
        <svg
          v-else
          class="user-img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12,12.5c-3.04,0-5.5,1.73-5.5,3.5s2.46,3.5,5.5,3.5,5.5-1.73,5.5-3.5-2.46-3.5-5.5-3.5Zm0-.5c1.66,0,3-1.34,3-3s-1.34-3-3-3-3,1.34-3,3,1.34,3,3,3Z"
          ></path>
        </svg>
      </div>
    </div>
    <div class="notice-content">
      <div class="username">{{ jugador ? jugador.username : "Invitado" }}</div>
      <div class="lable-message">
        <span> {{ jugador ? jugador.username : "Invitado" }} </span>
      </div>
      <div class="user-id">@{{ jugador ? jugador.id : "N/A" }}</div>
    </div>
  </button>
</template>

<style scoped>
#btn-message {
  --text-color: rgb(255, 255, 255);
  --bg-color-sup: #5e5e5e;
  --bg-color: #2b2b2b;
  --bg-hover-color: #161616;
  --online-status: #00da00;
  --font-size: 20px;
  --btn-transition: all 0.2s ease-out;
}

.button-message {
  display: flex;
  justify-content: center;
  align-items: center;
  font: 400 var(--font-size) Helvetica Neue, sans-serif;
  box-shadow: 0 0 2.17382px rgba(0, 0, 0, 0.049),
    0 1.75px 6.01034px rgba(0, 0, 0, 0.07),
    0 3.63px 14.4706px rgba(0, 0, 0, 0.091), 0 22px 48px rgba(0, 0, 0, 0.14);
  background-color: var(--bg-color);
  border-radius: 4.25em;
  cursor: pointer;
  padding: 0.375em 0.625em 0.375em 0.375em;
  width: fit-content;
  height: 2.5em;
  border: 0;
  overflow: hidden;
  position: relative;
  transition: var(--btn-transition);
}

.button-message:hover {
  height: 3.5em;
  padding: 0.5em 1.25em 0.5em 0.5em;
  background-color: var(--bg-hover-color);
  transition: var(--btn-transition);
  transform: translateY(-0.5em);
  margin-bottom: -1em;
}

.button-message:active {
  transform: scale(0.99);
}

.content-avatar {
  width: 1.875em;
  height: 1.875em;
  margin: 0;
  transition: var(--btn-transition);
  position: relative;
}

.button-message:hover .content-avatar {
  width: 2.5em;
  height: 2.5em;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--bg-color-sup);
}

.user-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-user {
  position: absolute;
  width: 0.375em;
  height: 0.375em;
  right: 1px;
  bottom: 1px;
  border-radius: 50%;
  outline: solid 0.125em var(--bg-color);
  background-color: var(--online-status);
  transition: var(--btn-transition);
  animation: active-status 2s ease-in-out infinite;
}

.button-message:hover .status-user {
  width: 0.625em;
  height: 0.625em;
  right: 1px;
  bottom: 1px;
  outline: solid 0.1875em var(--bg-hover-color);
}

.notice-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-left: 0.5em;
  text-align: initial;
  color: var(--text-color);
}

.username {
  letter-spacing: -6px;
  height: 0;
  opacity: 0;
  transform: translateY(-1.25em);
  transition: var(--btn-transition);
}

.user-id {
  font-size: 0.75em;
  letter-spacing: -6px;
  height: 0;
  opacity: 0;
  transform: translateY(0.625em);
  transition: var(--btn-transition);
}

.lable-message {
  display: flex;
  align-items: center;
  opacity: 1;
  transform: scaleY(1);
  transition: var(--btn-transition);
}

.button-message:hover .username {
  height: auto;
  letter-spacing: normal;
  opacity: 1;
  transform: translateY(0);
  transition: var(--btn-transition);
}

.button-message:hover .user-id {
  height: auto;
  letter-spacing: normal;
  opacity: 1;
  transform: translateY(0);
  transition: var(--btn-transition);
}

.button-message:hover .lable-message {
  height: 0;
  transform: scaleY(0);
  transition: var(--btn-transition);
}

.lable-message,
.username {
  font-weight: 600;
}

.number-message {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 0.5em;
  font-size: 0.75em;
  width: 1.333em;
  height: 1.333em;
  background-color: var(--bg-color-sup);
  border-radius: 20px;
}

@keyframes active-status {
  0% {
    background-color: var(--online-status);
  }

  33.33% {
    background-color: #93e200;
  }

  66.33% {
    background-color: #93e200;
  }

  100% {
    background-color: var(--online-status);
  }
}
</style>
