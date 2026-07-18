from fastapi import APIRouter

router = APIRouter()


@router.get('/', tags=['items'])
async def read_items():
    return "Hello Items"


# @router.post('/', tags=['items'])
# async def post_items():
