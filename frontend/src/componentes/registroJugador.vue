<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import { playerName, playerId } from "../logic/globalState.js";

const emit = defineEmits(["registrado"]);
const nomJugador = ref("");
const errorMessage = ref("");
const estaGirada = ref(false);

const handleJoinedLobby = (payload) => {
  console.log("Successfully joined lobby:", payload);
  emit("registrado", payload);
};

const handlePlayerRegistered = (payload) => {
  console.log("Jugador registrado:", payload);
  playerId.value = payload.playerId;
  playerName.value = payload.username;
};

const handleJoinError = (payload) => {
  console.error("Join error:", payload.message);
  errorMessage.value = payload.message;
  estaGirada.value = false;
};

// --- Lógica de la Tarjeta (Integrada) ---
function intentarGirar() {
  if (nomJugador.value && nomJugador.value.trim() !== "") {
    estaGirada.value = true;
    errorMessage.value = "";
  } else {
    errorMessage.value = "Has d'introduir un nom.";
    estaGirada.value = false;
  }
}

// --- Lógica de Conexión (Tu lógica, llamada por el botón trasero) ---
function connectarAlServidor() {
  errorMessage.value = "";
  communicationManager.connect();
  communicationManager.emit("player_join", {
    username: nomJugador.value,
  });
}

// --- Hooks de Ciclo de Vida (Tu lógica) ---
onMounted(() => {
  communicationManager.on("player_registered", handlePlayerRegistered);
  communicationManager.on("joined_lobby", handleJoinedLobby);
  communicationManager.on("join_error", handleJoinError);
});

onUnmounted(() => {
  communicationManager.off("player_registered", handlePlayerRegistered);
  communicationManager.off("joined_lobby", handleJoinedLobby);
  communicationManager.off("join_error", handleJoinError);
});
</script>

<template>
  <!-- From Uiverse.io by Praashoo7 -->
  <div class="flip-card">
    <div class="flip-card-inner" :class="{ 'esta-girada': estaGirada }">
      <div class="flip-card-front">
        <p class="heading_8264">MASTERCARD</p>
        <svg
          class="logo"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          width="36"
          height="36"
          viewBox="0 0 48 48"
        >
          <path
            fill="#ff9800"
            d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"
          ></path>
          <path
            fill="#d50000"
            d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"
          ></path>
          <path
            fill="#ff3d00"
            d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"
          ></path>
        </svg>
        <svg
          version="1.1"
          class="chip"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="30px"
          height="30px"
          viewBox="0 0 50 50"
          xml:space="preserve"
        >
          <image
            id="image0"
            width="50"
            height="50"
            x="0"
            y="0"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
              AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOY
              fEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSW
              ekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GS
              e0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOW
              ekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bf
              u3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWua
              fUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1
              lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrb
              tnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOh
              g0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU
              /f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dE
              orDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2Ng
              GAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVg
              OkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3d
              I2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6a
              lKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkI
              JVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0F
              qBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM
              1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGm
              BSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCET
              amiEqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdC
              S24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAACV0RVh0ZGF0ZTpj
              cmVhdGUAMjAyMy0wMi0xM1QwODoxNToyOSswMDowMEUnN7UAAAAldEVYdGRhdGU6bW9kaWZ5ADIw
              MjMtMDItMTNUMDg6MTU6MjkrMDA6MDA0eo8JAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAy
              LTEzVDA4OjE1OjI5KzAwOjAwY2+u1gAAAABJRU5ErkJggg=="
          ></image>
        </svg>
        <svg
          version="1.1"
          class="contactless"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="20px"
          height="20px"
          viewBox="0 0 50 50"
          xml:space="preserve"
        >
          <image
            id="image0"
            width="50"
            height="50"
            x="0"
            y="0"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
              AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ
              cwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQf
              lGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/F
              fPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xN
              GQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49it
              VoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJk
              HpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15z
              bkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6g
              DJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJ
              qSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKB
              sSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71Amz
              Z+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uX
              XSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUi
              cUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaI
              nKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBK
              xDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDIt
              MTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5
              OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1Nisw
              MDowMIXeN6gAAAAASUVORK5CYII="
          ></image>
        </svg>
        <p class="number">9759 2484 5269 6576</p>
        <p class="valid_thru">VALID THRU</p>
        <p class="date_8264">12 / 26</p>
        <input
          type="text"
          class="name"
          v-model="nomJugador"
          placeholder="Escriu el teu nom"
          @keydown.enter.prevent="intentarGirar"
        />

        <button class="confirmar-btn" @click="intentarGirar">OK</button>
        <p v-if="errorMessage" class="error-frontal">{{ errorMessage }}</p>
      </div>
      <div class="flip-card-back">
        <div class="strip"></div>
        <div class="mstrip"></div>
        <div class="sstrip">
          <button class="code" @click="connectarAlServidor">Entrar</button>
          <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tus estilos ... */
.flip-card {
  background-color: transparent;
  width: 240px;
  height: 154px;
  perspective: 1000px;
  color: white;
  transform: scale(2);
}
/* ... (heading_8264, logo, chip, contactless, number, etc.) ... */
.heading_8264 {
  position: absolute;
  letter-spacing: 0.2em;
  font-size: 0.5em;
  top: 2em;
  left: 18.6em;
}

.logo {
  position: absolute;
  top: 6.8em;
  left: 11.7em;
}

.chip {
  position: absolute;
  top: 2.3em;
  left: 1.5em;
}

.contactless {
  position: absolute;
  top: 3.5em;
  left: 12.4em;
}

.number {
  position: absolute;
  font-weight: bold;
  font-size: 0.6em;
  top: 8.3em;
  left: 1.6em;
}

.valid_thru {
  position: absolute;
  font-weight: bold;
  top: 635.8em;
  font-size: 0.01em;
  left: 140.3em;
}

.date_8264 {
  position: absolute;
  font-weight: bold;
  font-size: 0.5em;
  top: 13.6em;
  left: 3.2em;
}

/* - Estilos del input 'name' ajustados
*/
.name {
  position: absolute;
  font-weight: bold;
  font-size: 0.5em;
  top: 16.1em;
  left: 2em;
  /* Acortamos el input para hacer sitio al botón */
  width: 9em;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border-radius: 3px;
  border: none;
  padding: 2px 5px;
}
.name::placeholder {
  color: #555;
}

/* - Nuevos estilos para el botón "OK"
*/
.confirmar-btn {
  position: absolute;
  top: 16.1em;
  left: 11.5em; /* Justo al lado del input */
  font-size: 0.5em;
  font-weight: bold;
  background: #ff9800;
  color: black;
  border: none;
  border-radius: 3px;
  padding: 2px 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.confirmar-btn:hover {
  background: #ffb74d;
}

/* - Nuevos estilos para el error en el frontal
*/
.error-frontal {
  position: absolute;
  top: 18em;
  left: 0;
  width: 100%;
  text-align: center;
  color: #ff5252;
  font-size: 0.5em;
  font-weight: bold;
}

/* ... (strip, mstrip, sstrip, code) ... */
.strip {
  position: absolute;
  background-color: black;
  width: 15em;
  height: 1.5em;
  top: 2.4em;
  background: repeating-linear-gradient(
    45deg,
    #303030,
    #303030 10px,
    #202020 10px,
    #202020 20px
  );
}

.mstrip {
  position: absolute;
  background-color: rgb(255, 255, 255);
  width: 8em;
  height: 0.8em;
  top: 5em;
  left: 0.8em;
  border-radius: 2.5px;
}

.sstrip {
  position: absolute;
  background-color: rgb(255, 255, 255);
  width: 4.1em;
  height: 0.8em;
  top: 5em;
  left: 10em;
  border-radius: 2.5px;
}

.code {
  font-weight: bold;
  text-align: center;
  margin: 0.2em;
  color: black;
  cursor: pointer;
  background: #ddd;
  border: none;
  border-radius: 2px;
  padding: 3px 10px;
}
.code:hover {
  background: #fff;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

/* - Eliminada la regla :hover
  - Añadida la regla .esta-girada
*/
.flip-card-inner.esta-girada {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 1rem;
}

.flip-card-front {
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
  background-color: #171717;
}

.flip-card-back {
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
  background-color: #171717;
  transform: rotateY(180deg);
}
</style>
