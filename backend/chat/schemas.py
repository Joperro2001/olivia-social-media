from pydantic.v1 import BaseModel, Field
from typing import Dict, Any # Keep Any if used by future checklist schemas

# --- Pydantic Models for History Tool Inputs ---
class WriteMessageInput(BaseModel):
    user_id: str = Field(description="Identifier for the user.")
    session_id: str = Field(description="Identifier for the specific conversation session.")
    message_type: str = Field(description="Indicates if the message is from 'human' or 'ai'.")
    content: str = Field(description="The actual content of the message.")

class WriteSummaryInput(BaseModel):
    user_id: str = Field(description="Identifier for the user.")
    summary_content: str = Field(description="The content of the summary to be written.")

class ReadHistoryInput(BaseModel):
    user_id: str = Field(description="Identifier for the user.")
    max_messages: int = Field(default=10, description="Maximum number of messages to retrieve.")
    include_summary: bool = Field(default=True, description="Whether to include the latest summary.")

# --- Pydantic Models for Checklist Tool Inputs ---
class ReadChecklistInput(BaseModel):
    user_id: str = Field(description="Identifier for the user whose checklist is to be read.")

class WriteChecklistInput(BaseModel):
    user_id: str = Field(description="Identifier for the user whose checklist is to be written.")
    checklist_data: Dict[str, Any] = Field(description="The checklist data in JSON format. This will overwrite any existing checklist for the user.")

class DeleteChecklistInput(BaseModel):
    user_id: str = Field(description="Identifier for the user whose checklist is to be deleted.")

