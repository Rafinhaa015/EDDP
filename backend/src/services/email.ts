import { config } from '../config.js';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Envia e-mail transacional via Resend, SendGrid ou console (desenvolvimento). */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const { provider, from, resendApiKey, sendgridApiKey } = config.email;

  if (provider === 'resend' && resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
    });
    if (!res.ok) throw new Error(`Resend falhou: ${res.status} ${await res.text()}`);
    return;
  }

  if (provider === 'sendgrid' && sendgridApiKey) {
    const match = from.match(/^(.*)<(.+)>$/);
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sendgridApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: msg.to }] }],
        from: match ? { name: match[1].trim(), email: match[2].trim() } : { email: from },
        subject: msg.subject,
        content: [
          { type: 'text/plain', value: msg.text },
          { type: 'text/html', value: msg.html },
        ],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid falhou: ${res.status} ${await res.text()}`);
    return;
  }

  if (config.nodeEnv !== 'test') {
    console.log(`\n📧 [email:console] Para: ${msg.to}\nAssunto: ${msg.subject}\n${msg.text}\n`);
  }
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px">
  <tr><td><h1 style="margin:0 0 16px;font-size:22px;color:#0f172a">${title}</h1>${body}
  <p style="margin-top:32px;font-size:12px;color:#64748b">${config.productName} · Dúvidas? ${config.supportEmail}</p>
  </td></tr></table></td></tr></table></body></html>`;
}

export function welcomeEmail(name: string, to: string): EmailMessage {
  const first = name.split(' ')[0];
  return {
    to,
    subject: `Bem-vindo(a) ao ${config.productName}, ${first}!`,
    text: `Olá, ${first}! Seu cadastro foi confirmado. Acesse ${config.appUrl}/dashboard e comece pela Sessão 1.`,
    html: layout(
      `Bem-vindo(a), ${first}!`,
      `<p style="color:#334155;line-height:1.6">Seu cadastro foi confirmado. A primeira aula já está esperando por você.</p>
       <p><a href="${config.appUrl}/dashboard" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Começar agora</a></p>`,
    ),
  };
}

export function resetPasswordEmail(name: string, to: string, token: string): EmailMessage {
  const link = `${config.appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;
  const first = name.split(' ')[0];
  return {
    to,
    subject: 'Redefinição de senha',
    text: `Olá, ${first}. Para criar uma nova senha acesse: ${link}\nO link expira em ${config.resetTokenTtlMinutes} minutos. Se você não pediu, ignore este e-mail.`,
    html: layout(
      'Redefinir sua senha',
      `<p style="color:#334155;line-height:1.6">Olá, ${first}. Recebemos um pedido para redefinir sua senha.</p>
       <p><a href="${link}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Criar nova senha</a></p>
       <p style="color:#64748b;font-size:13px">O link expira em <b>${config.resetTokenTtlMinutes} minutos</b>. Se você não fez esse pedido, ignore este e-mail.</p>`,
    ),
  };
}
