# Tạm thời comment import Document để tránh lỗi web3
from .document import Document
from .request import AdminRequest
from .document_type import DocumentType
from .attachment import Attachment
from .approval import Approval
from .activity import Activity

__all__ = ['Document', 'AdminRequest', 'DocumentType', 'Attachment', 'Approval', 'Activity'] # 'Document' added back 