from sqlmodel import create_engine,Session,select

DATABASE_URL = "mysql+pymysql://root:@localhost:3306/projectmangement"

engine = create_engine(DATABASE_URL, echo=True)

def get_session():

    with Session(engine) as session:

        yield session
