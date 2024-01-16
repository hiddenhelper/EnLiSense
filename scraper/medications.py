import requests
from bs4 import BeautifulSoup
import pymongo
from datetime import datetime
import os
from bson.objectid import ObjectId

MONGO_URL = os.environ.get('MONGO_URL')
myclient = pymongo.MongoClient(MONGO_URL)
mydb = myclient["enlisense"]
mycol = mydb["entries"]

x = mycol.delete_many({ "owner": "Enlisense" })

URL = "https://www.crohnscolitisfoundation.org/ibd-medication"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

results = soup.find(id="Container")

medication_item = results.find_all("div", class_="medication-item")

for item in medication_item:
    # drug name
    drug_name_tmp = item.find("div", class_="drug-name")
    drug_name = drug_name_tmp.text.replace('®', '').replace(',', '').replace('™', '').replace('\n', '').replace('                          ', '').strip()
    print(drug_name)

    # generic-name (name)
    generic_name_tmp = item.find("div", class_="generic-name")
    generic_name = generic_name_tmp.text.replace('®', '').replace(',', '').replace('™', '').replace('\n', '').replace('                          ', '').strip()
    print(generic_name)

    # drug-class
    drug_class_outer = item.find("div", class_="drug-class")
    drug_class_tmp = drug_class_outer.find("div", class_="text")
    drug_class = drug_class_tmp.text.replace('®', '').replace(',', '').replace('™', '').replace('\n', '').replace('                          ', '').strip()
    print(drug_class)

    # drug-type
    drug_type_outer = item.find("div", class_="drug-type")
    if (drug_type_outer):
        drug_type_tmp = drug_type_outer.find("div", class_="text")
        drug_type = drug_type_tmp.text.replace('®', '').replace(',', '').replace('™', '').replace('\n', '').replace('                          ', '').strip()
        print(drug_type)
    else:
        drug_type = ""
        print(drug_type)

    now = datetime.now()
    date_time = now.strftime("%Y-%m-%dT%H:%M:%S.%f+00:00")

    mydict = {
        "_id": str(ObjectId()),
        "name": drug_name,
        "genericName": generic_name,
        "drugClass": drug_class,
        "drugType": drug_type,
        "route": "entryAdd",
        "entryTimestamp": date_time,
        "type": "Medication",
        "brand": "",
        "barcode": "",
        "category": "",
        "notes": "",
        "parents": [],
        "children": [],
        "selected": [],
        "owner": "Enlisense"
    }

    x = mycol.insert_one(mydict)
