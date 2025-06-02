from fastapi import APIRouter
from app.routes import auth, users, habits, streak, rest
from app.models.lemi import api as lemi
from app.models.sami import api as sami
from app.models.string import api as string
from app.models.abe import api as abe
from app.models.sister import api as sister
from app.models.brothers import api as brothers
from app.models.brotherss import api as brotherss
from app.models.simo import api as simo
from app.models.esua import api as esua
from app.models.anchim import api as anchim
from app.models.z import api as z
from app.models.aa import api as aa
from app.models.b import api as b
router = APIRouter()


router.include_router(auth.router)
router.include_router(users.router)
router.include_router(habits.router)
router.include_router(streak.router)
router.include_router(rest.router)
router.include_router(lemi.router)
router.include_router(sami.router)
router.include_router(string.router)
router.include_router(abe.router)
router.include_router(sister.router)
router.include_router(brothers.router)
router.include_router(brotherss.router)
router.include_router(simo.router)
router.include_router(esua.router)
router.include_router(anchim.router)
router.include_router(z.router)
router.include_router(aa.router)
router.include_router(b.router)