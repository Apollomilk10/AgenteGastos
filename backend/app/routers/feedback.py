from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from ..auth import get_current_user
from ..email_service import enviar_email_feedback
from ..firebase import db
from ..models import FeedbackInput

router = APIRouter(tags=["feedback"])


@router.post("/feedback")
async def enviar_feedback(
    body: FeedbackInput,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    mensagem = body.mensagem.strip()
    if not mensagem:
        raise HTTPException(status_code=400, detail="Mensagem vazia.")

    db.collection("feedback").add({
        "mensagem": mensagem,
        "email": user["email"],
        "criadoEm": datetime.now(timezone.utc),
    })

    # Envia o e-mail em segundo plano, sem atrasar a resposta pro usuário
    background_tasks.add_task(enviar_email_feedback, mensagem, user["email"])

    return {"status": "ok"}
