function changeTheme(color1, color2, color3) {
  const root = document.documentElement;
  root.style.setProperty("--color-1", color1);
  root.style.setProperty("--color-2", color2);
  root.style.setProperty("--color-3", color3);
}
function togglePassword() {
  var password = document.getElementById("password");
  if (password.type === "password") {
    password.type = "text";
  } else password.type = "password";
}
