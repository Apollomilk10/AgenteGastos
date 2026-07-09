import os
import smtplib
from email.mime.text import MIMEText

SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD")
FEEDBACK_EMAIL_TO = os.environ.get("FEEDBACK_EMAIL_TO", "lleitetavares@gmail.com")


def enviar_email_feedback(mensagem: str, de_email: str) -> None:
    """Envia um e-mail avisando sobre um novo feedback. Se as credenciais
    de SMTP não estiverem configuradas, simplesmente não faz nada (não
    quebra o fluxo de salvar o feedback)."""
    if not SMTP_EMAIL or not SMTP_APP_PASSWORD:
        return

    corpo = f"Novo feedback recebido no app:\n\nDe: {de_email}\n\nMensagem:\n{mensagem}"
    msg = MIMEText(corpo)
    msg["Subject"] = "Novo feedback — Obra App"
    msg["From"] = SMTP_EMAIL
    msg["To"] = FEEDBACK_EMAIL_TO

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_EMAIL, SMTP_APP_PASSWORD)
            server.sendmail(SMTP_EMAIL, [FEEDBACK_EMAIL_TO], msg.as_string())
    except Exception:
        # Não deixa o envio de e-mail falho derrubar o salvamento do feedback
        pass
