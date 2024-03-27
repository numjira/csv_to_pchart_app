#from typing import Union
from fastapi import FastAPI,Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any,Optional
from . import crud
from sqlalchemy.orm import Session
from .database import SessionLocal,engine
import json
import datetime

app = FastAPI()
origins = ["*"]

def get_db():
    db =SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DataWithIn(BaseModel):
    LineName: str
    Shift: str
    Data: List[dict]
    date_picker : str
    # str
    # 

class DataWithDB(BaseModel):
    # id: str
    LineName:str
    Shift:str
    Data:List[dict]
    date_picker:str
    #Optional[datetime.datetime]
    
    # created_at: str
    # updated_at: str

class ResponseLineName(BaseModel):
    value:str ##รับค่า value จาก database

class ResponseResultdata(BaseModel):
    value:List[dict]


##########################################################################
#########################################################################
class DefectDataEiei(BaseModel):
    LineName:str
    Category:str
    Shift:str
    Data:List[dict]
    date_picker:str


@app.post("/input")  # Change this to POST
async def post_input(data: List[DataWithIn],db: Session = Depends(get_db)):
    try:
        for item in data:
            item.Data = json.dumps(item.Data)
            success = await crud.post_input(db=db, item=item)
            if not success:
                raise HTTPException(status_code=400, detail=f"Error postdate : {e}")
        return {"success": True}
    except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error during post data : {e}")

###########################################
@app.get("/get_data",response_model=List[DataWithDB])
async def get_data(db: Session = Depends(get_db)):
    try:
        data = await crud.get_data(db=db)  # Replace with your actual function to fetch data
        response_data = []
        for item in data:
            response_data.append(DataWithDB(LineName=item["line_name"], Shift=item["shift"], Data=item["data"],date_picker=item["date_picker"])) ###,date_picker=item["date_picker"]
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    
@app.get("/get_linename",response_model=List[ResponseLineName])
async def get_data(db: Session = Depends(get_db)):
    try:
        data = await crud.get_data(db=db)  
        response_data = []
        for item in data:
            response_data.append(ResponseLineName(value=item["line_name"])) ##แปลงค่าจาก line_name เป็นตัวแปร value เพื่อให้ get ค่าจาก database ได้
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

###########################################################
@app.get("/get_resultdata",response_model=List[ResponseResultdata])
async def get_data(line_name: str, shift: str, date_picker:str, db: Session = Depends(get_db)):    ##, date_picker:Optional[datetime.datetime]
    try:
        data = await crud.get_resultdata(line_name=line_name, shift=shift,date_picker=date_picker ,db=db)      ##,date_picker=date_picker
        response_data = []
        for item in data:
            response_data.append(ResponseResultdata(value=item["data"]))##line_name=item["line_name"], shift=item["shift"
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")






##############################################################
##############################################################
@app.post("/input2")  # Change this to POST
async def post_input2(data: List[DefectDataEiei],db: Session = Depends(get_db)):
    try:
        for item in data:
            item.Data = json.dumps(item.Data)
            success = await crud.post_input2(db=db, item=item)
            if not success:
                raise HTTPException(status_code=400, detail=f"Error postdate : {e}")
        return {"success": True}
    except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error during post data : {e}")

###########################################################################
@app.get("/get_data2",response_model=List[DefectDataEiei])
async def get_data2(db: Session = Depends(get_db)):
    try:
        data = await crud.get_data2(db=db)  # Replace with your actual function to fetch data
        response_data = []
        for item in data:
            response_data.append(DefectDataEiei(LineName=item["line_name"],Category=item["category"], Shift=item["shift"], Data=item["data"],date_picker=["date_picker"]))
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/get_category",response_model=List[ResponseLineName])
async def get_data2(db: Session = Depends(get_db)):
    try:
        data = await crud.get_data2(db=db)  
        response_data = []
        for item in data:
            response_data.append(ResponseLineName(value=item["category"])) 
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    
    ###########################################

@app.get("/get_resultdata2",response_model=List[ResponseResultdata])
async def get_data2(line_name: str,shift:str,category:str,date_picker:str, db: Session = Depends(get_db)):
    try:
        data = await crud.get_resultdata2(line_name=line_name,shift=shift,category=category,date_picker=date_picker,db=db)
        response_data = []
        for item in data:
            response_data.append(ResponseResultdata(value=item["data"]))##line_name=item["line_name"], shift=item["shift"
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    
    ###########################################
@app.get("/get_resultCategory",response_model=List[ResponseLineName])
async def get_data2(line_name: str,shift:str, db: Session = Depends(get_db)):
    try:
        data = await crud.get_resultCategory(line_name=line_name,shift=shift,db=db)
        response_data = []
        for item in data:
            response_data.append(ResponseLineName(value=item["category"]))
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")