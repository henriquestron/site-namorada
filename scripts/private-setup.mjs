import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline";

// Never accept a password as a CLI argument, to keep it out of shell history.
if (!process.stdin.isTTY) { console.error("Execute em um terminal interativo: npm run private:setup"); process.exit(1); }
async function hidden(prompt) {
  process.stdout.write(prompt);
  process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding("utf8");
  readline.emitKeypressEvents(process.stdin);
  return new Promise((resolve) => {
    let value = "";
    const listener = (text, key) => {
      if (key?.ctrl && key.name === "c") { process.stdin.setRawMode(false); process.stdout.write("\n"); process.exit(1); }
      if (key?.name === "return") { process.stdin.off("keypress", listener); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write("\n"); resolve(value); }
      else if (key?.name === "backspace") value = value.slice(0, -1);
      else if (text && !key?.ctrl && !key?.meta && !/[\x00-\x1f\x7f]/.test(text)) value += text;
    };
    process.stdin.on("keypress", listener);
  });
}
const password = await hidden("Crie sua senha (mínimo de 14 caracteres, não será exibida): ");
if (password.length < 14 || password.length > 256) { console.error("Use de 14 a 256 caracteres."); process.exit(1); }
const confirmation = await hidden("Repita a senha: ");
if (password !== confirmation) { console.error("As senhas não conferem."); process.exit(1); }
const salt = randomBytes(16).toString("hex");
console.log("\nCopie estas variáveis somente para o ambiente do servidor. Não faça commit:");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
console.log("\nNa Vercel, cadastre as duas variáveis acima e faça um novo deploy.");
console.log("Para entrar em /preparar, use a senha que você acabou de digitar. Não use o hash nem a chave do Supabase.");
