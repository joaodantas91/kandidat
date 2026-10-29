<script lang="ts"></script>

<button type="button">Fill</button>

<style>
  button {
    border: 2px solid #fff;
    border-radius: 4px;
    width: 75px;
    height: 50px;
    background: #111;
    color: #fff;
    font-weight: bold;
    font-size: 18px;
    transition: all 0.2s ease;
    &:hover {
      filter: brightness(1.4);
    }
    &:active {
      transform: translateY(2px); /* Moves the button down */
    }
  }
</style>
