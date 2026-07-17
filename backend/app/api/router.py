from fastapi import APIRouter

router = APIRouter()


@router.get('/', tags=['api'])
async def read_api():
    return "Hello Api"
