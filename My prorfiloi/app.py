from flask import Flask, render_template, request, jsonify, flash, send_file, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from datetime import datetime
from functools import wraps
import os

# Load environment variables first
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mogalg71@gmail.com'
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = 'mogalg71@gmail.com'

# Set secret key for flash messages
app.secret_key = os.getenv('SECRET_KEY', 'dev')

db = SQLAlchemy(app)
mail = Mail(app)



# Models
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies = db.Column(db.String(200))
    image_url = db.Column(db.String(200))
    project_url = db.Column(db.String(200))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    summary = db.Column(db.Text)
    image_url = db.Column(db.String(200))
    updated_date = db.Column(db.DateTime, default=datetime.utcnow)

class Certification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.String(50))
    image_url = db.Column(db.String(200))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')



@app.route('/api/projects', methods=['GET'])
def api_projects():
    projects = Project.query.all()
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'technologies': p.technologies.split(',') if p.technologies else [],
        'image_url': p.image_url,
        'project_url': p.project_url,
        'created_date': p.created_date.isoformat()
    } for p in projects])



@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/games')
def games():
    return render_template('games.html')

@app.route('/download/resume/pdf')
def download_resume_pdf():
    try:
        return send_file('Resume Ganesh Mogal-2025.pdf', as_attachment=True)
    except Exception as e:
        flash('Error downloading PDF resume')
        return redirect(url_for('home'))

@app.route('/download/resume/word')
def download_resume_word():
    try:
        return send_file('Resume Ganesh Mogal-2025.docx', as_attachment=True)
    except Exception as e:
        flash('Error downloading Word resume')
        return redirect(url_for('home'))

@app.route('/api/profile', methods=['GET'])
def api_profile():
    profile = Profile.query.first()
    if not profile:
        return jsonify({})
    return jsonify({
        'summary': profile.summary,
        'image_url': profile.image_url
    })

@app.route('/api/certifications', methods=['GET'])
def api_certifications():
    certifications = Certification.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'level': c.level,
        'image_url': c.image_url,
        'created_date': c.created_date.isoformat()
    } for c in certifications])

@app.route('/send_message', methods=['POST'])
def send_message():
    try:
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        msg = Message(
            subject=f'Portfolio Contact from {name}',
            recipients=['mogalg71@gmail.com'],
            body=f'Name: {name}\nEmail: {email}\n\nMessage:\n{message}'
        )
        mail.send(msg)
        return jsonify({'status': 'success', 'message': 'Message sent successfully!'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)