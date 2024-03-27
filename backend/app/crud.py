from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from typing import List,Optional
from pydantic import BaseModel
from fastapi import HTTPException
import datetime

# กำหนด class ที่จะเก็บเข้า database ให้ตรงกับที่รับมาจาก backend
class DataItem(BaseModel):
    LineName:str
    Shift:str
    Data:List[dict]
    date_picker:str

class DatafromDB(BaseModel):
    # id: str
    LineName:str
    Shift:str
    Data:List[dict]
    # created_at: str
    # updated_at: str

class DefectFromDB(BaseModel):
    lineName:str
    Category:str
    Shift:str
    Data:List[dict]
    date_picker:str


#โครงสร้างภาษา SQL """......"""
async def post_input(item:DataItem,db: Session):
    print(item)
    try:
        # add     date_picker 
        # '{item.date_picker.strftime("%Y-%m-%d %H:%M:%S.%f")}'
        # DO NOTHING
        stmt = f"""
        INSERT INTO csvtodatabase(line_name, shift, data,date_picker) 
        VALUES (:line_name, :shift, cast(:data AS jsonb),:date_picker)
        ON CONFLICT (line_name,shift,date_picker)
        DO UPDATE SET
            line_name = EXCLUDED.line_name,
            shift = EXCLUDED.shift,
            data = EXCLUDED.data,
            date_picker = EXCLUDED.date_picker
        """
        res = db.execute(text(stmt),params={"line_name":item.LineName,"shift":item.Shift,"data":item.Data,"date_picker":item.date_picker}) 
        db.commit()
    except Exception as e:
        print(f"Error during post data: {e}")
        raise HTTPException(status_code=400, detail=f"Bad Request: {e}")
    return res


#####################################################
async def get_data(db: Session):
    try:
        #################### add date_picker ###############  
        stmt = """
        SELECT line_name, shift, data, date_picker FROM csvtodatabase
        """
        #id, line_name, shift, data, created_at, updated_at
        result = db.execute(text(stmt))
        data = [
            {"line_name": item[0], "shift": item[1], "data": item[2],"date_picker": item[3]} for item in result   ##    
        ]
        return data
    except Exception as e:
        raise e

######################################################
async def get_linename(db: Session):
    try:
        stmt = """
        SELECT DISTINCT line_name FROM csvtodatabase
        """
        result = db.execute(text(stmt))
        data = [
            {"line_name": item[0]} for item in result
        ]
        return data
    except Exception as e:
        raise e
    
##################################################

async def get_resultdata(line_name: str, shift: str, date_picker:str, db: Session): ##     , date_picker:Optional[datetime.datetime]
    try:
        ############ add date_picker################    AND date_picker=:date_picker
        stmt = """
        SELECT data FROM csvtodatabase
        WHERE line_name = :line_name AND shift = :shift AND date_picker=:date_picker;
        """
        result = db.execute(text(stmt), {"line_name": line_name, "shift": shift,"date_picker":date_picker})  ##  ,"date_picker":date_picker
        data = [{"data": item[0]} for item in result]
        return data
    except Exception as e:
        raise e

################################################################################################################
    









################################################################################################################
    
async def post_input2(item:DefectFromDB,db:Session):
    print(item)
    try:
        stmt = f"""
        INSERT INTO defectdatabase(line_name, category, shift, data,date_picker)
	    VALUES (:line_name, :category, :shift, cast(:data AS jsonb),:date_picker)
        ON CONFLICT (line_name,category,shift,date_picker)
        DO UPDATE SET
            line_name = EXCLUDED.line_name,
            category = EXCLUDED.category,
            shift = EXCLUDED.shift,
            data = EXCLUDED.data,
            date_picker= EXCLUDED.date_picker
        """
        res = db.execute(text(stmt),params={"line_name":item.LineName,"category":item.Category,"shift":item.Shift,"data":item.Data,"date_picker":item.date_picker})
        db.commit()
    except Exception as e:
        print(f"Error during post data: {e}")
        raise HTTPException(status_code=400, detail=f"Bad Request: {e}")
    return res

#####################################################
async def get_data2(db: Session):
    try:
        stmt = """
        SELECT line_name, category, shift, data, date_picker FROM defectdatabase
        """
        #id, line_name, shift, data, created_at, updated_at
        result = db.execute(text(stmt))
        data = [
            {"line_name": item[0], "category": item[1], "shift": item[2], "data": item[3],"date_picker":item[4]} for item in result
        ]
        return data
    except Exception as e:
        raise e
#####################################################
async def get_category(db: Session):
    try:
        stmt = """
        SELECT DISTINCT category FROM defectdatabase
        """
        result = db.execute(text(stmt))
        data = [
            {"category": item[0]} for item in result
        ]
        return data
    except Exception as e:
        raise e
    
async def get_resultdata2(line_name: str,shift:str,category:str,date_picker:str, db: Session):  ## Add parameters here
    try:
        stmt = """
        SELECT data FROM defectdatabase
        WHERE line_name = :line_name AND shift = :shift AND category = :category AND date_picker = :date_picker;
        """
        result = db.execute(text(stmt), {"line_name": line_name, "shift": shift,"category":category,"date_picker":date_picker})  ## Pass parameters here
        data = [{"data": item[0]} for item in result]
        return data
    except Exception as e:
        raise e
    
async def get_resultCategory(line_name: str,shift:str, db: Session):  ## Add parameters here
    try:
        stmt = """
        SELECT category FROM defectdatabase
        WHERE line_name = :line_name AND shift = :shift ;
        """
        result = db.execute(text(stmt), {"line_name": line_name, "shift": shift})  ## Pass parameters here
        data = [{"category": item[0]} for item in result]
        return data
    except Exception as e:
        raise e