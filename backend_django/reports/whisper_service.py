"""
Servicio de transcripción de audio usando OpenAI Whisper
"""

import os
from openai import OpenAI
from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile
import tempfile


class WhisperTranscriptionService:
    """
    Servicio para transcribir audio a texto usando Whisper
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def transcribe_audio(self, audio_file: InMemoryUploadedFile, language: str = "es") -> dict:
        """
        Transcribe un archivo de audio a texto
        
        Args:
            audio_file: Archivo de audio (formato: mp3, mp4, mpeg, mpga, m4a, wav, webm)
            language: Código de idioma (default: español)
            
        Returns:
            {
                'text': str,  # Transcripción completa
                'language': str,  # Idioma detectado
                'duration': float  # Duración en segundos (si está disponible)
            }
        """
        
        # Whisper acepta archivos directamente, pero a veces es mejor guardar temporalmente
        try:
            # Crear archivo temporal
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as temp_file:
                for chunk in audio_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            # Transcribir con Whisper
            with open(temp_file_path, 'rb') as audio:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    language=language,
                    response_format="json"
                )
            
            # Limpiar archivo temporal
            os.unlink(temp_file_path)
            
            return {
                'text': transcript.text,
                'language': language,
                'success': True
            }
            
        except Exception as e:
            # Limpiar en caso de error
            if 'temp_file_path' in locals():
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
            
            raise Exception(f"Error al transcribir audio: {str(e)}")
    
    def estimate_cost(self, duration_seconds: float) -> float:
        """
        Estima el costo de transcripción
        Whisper cuesta $0.006 por minuto
        """
        minutes = duration_seconds / 60
        cost = minutes * 0.006
        return round(cost, 4)
