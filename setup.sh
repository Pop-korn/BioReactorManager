npx create-vite frontend --template react
cd frontend
npm install
npm run dev -- --host
# Replace the content of `App.jsx` 

cd ..
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn
pip install -r requirements.txt

mkdir backend
cd backend
# Paste in `main.py`
mkdir static  # For images
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
