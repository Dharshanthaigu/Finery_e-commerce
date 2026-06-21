from fastapi import Depends , HTTPException , status
from fastapi.security import HTTPBearer ,  HTTPAuthorizationCredentials
from app.security import decode_access_token

security_scheme = HTTPBearer()

async def get_current_user(credentails: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    token = credentails.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Invalid or expired date")
    return payload