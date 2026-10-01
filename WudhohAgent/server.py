import os

import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# =====================================================
# IMPORT POLICY AGENT
# =====================================================

from agent import analyze_product_policy


# =====================================================
# CREATE FASTAPI SERVER
# =====================================================

app = FastAPI(
    title="Wudhoh Policy Agent API"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =====================================================
# REQUEST MODEL
# =====================================================

class PolicyRequest(BaseModel):

    product_name: str = Field(
        min_length=1,
        max_length=500
    )

    policy_text: str = Field(
        min_length=1,
        max_length=100_000
    )


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "status":
            "Wudhoh Agent Server is Running!"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "wudhoh-agent"
    }


# =====================================================
# ANALYZE POLICY
# =====================================================

@app.post("/analyze")
async def analyze_policy_endpoint(
    data: PolicyRequest
):

    print("\n" + "=" * 60)

    print(
        "📩 Wudhoh received policy request"
    )

    print(
        f"🛍️ Product: {data.product_name}"
    )

    print(
        f"📄 Policy length: {len(data.policy_text)} characters"
    )


    # =================================================
    # RUN AGENT
    # =================================================

    result = analyze_product_policy(

        product_name=
            data.product_name,

        policy_text=
            data.policy_text
    )


    # =================================================
    # LOG RESULT
    # =================================================

    print(
        f"🤖 Agent Result: {result}"
    )

    print("=" * 60)


    # =================================================
    # RETURN TO CLIENT
    # =================================================

    return result


# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":

    uvicorn.run(

        "server:app",

        host="0.0.0.0",

        port=int(
            os.getenv(
                "PORT",
                "8000"
            )
        ),

        reload=False
    )
