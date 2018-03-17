import pandas as pd
from flask import Flask, render_template, jsonify, redirect, \
                request, session, g, url_for, abort
from flask_sqlalchemy import SQLAlchemy
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import sqlite3
import os

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
# The database URI
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get('DATABASE_URL', '') or "sqlite:///db/belly_button_biodiversity.sqlite"

db = SQLAlchemy(app)

engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")
Base = automap_base()
Base.prepare(engine, reflect=True)

Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

session = Session(bind=engine)

#################################################
# Flask Routes
#################################################
@app.route("/")
def home():
    """Render Home Page."""
    return render_template("index.html")

@app.route("/names")
def names():
    """Return emoji score and emoji char"""

    names = Base.metadata.tables["samples"].columns.keys()[1:]
    return jsonify(names)

@app.route("/otu")
def otu():

    otus = session.query(Otu.lowest_taxonomic_unit_found).all()
    otus = [otu[0] for otu in otus]
    return jsonify(otus)

@app.route("/metadata/<sample>")
def metadata(sample):
    target = sample.split("_")[1]
    metadata = session.query(Samples_metadata.AGE, Samples_metadata.BBTYPE, Samples_metadata.ETHNICITY, Samples_metadata.GENDER, Samples_metadata.LOCATION, Samples_metadata.SAMPLEID).filter(Samples_metadata.SAMPLEID == target).all()
    
    metadata_list = {}
    metadata_list["AGE"] = metadata[0][0]
    metadata_list["BBTYPE"] = metadata[0][1]
    metadata_list["ETHNICITY"] = metadata[0][2]
    metadata_list["GENDER"] = metadata[0][3]
    metadata_list["LOCATION"] = metadata[0][4]
    metadata_list["SAMPLEID"] = metadata[0][5]

    metadata_list = jsonify(metadata_list)

    return metadata_list

@app.route("/wfreq/<sample>")
def wfreq(sample):
    target = sample.split("_")[1]
    wfreq = session.query(Samples_metadata.WFREQ).filter(Samples_metadata.SAMPLEID == target).all()
    return jsonify(wfreq)

@app.route("/samples/<sample>")
def samples(sample):
    query = session.query(Samples)
    sample_df = pd.read_sql(query.statement, query.session.bind)
    
    sample_series = sample_df[sample]
    otu_series = sample_df["otu_id"]

    df = pd.DataFrame({"1": otu_series, "2": sample_series})
    df = df.loc[df["2"] != 0].sort_values(by=['2'], ascending=False)

    otu_ids = list(map(int, df["1"].values))
    values =  list(map(int, df["2"].values))
    
    return jsonify({"otu_ids": otu_ids, "sample_values": values})

if __name__ == '__main__':
    app.run(debug=True)