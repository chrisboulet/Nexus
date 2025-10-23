#!/usr/bin/env python3
"""
Setup script for Nexus
"""

import os
import sys
import json
from pathlib import Path


def check_python_version():
    """Check if Python version is 3.9 or higher"""
    if sys.version_info < (3, 9):
        print("Error: Python 3.9 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    return True


def check_config():
    """Check if configuration file exists"""
    config_file = Path("config.json")
    example_config = Path("config.example.json")
    
    if not config_file.exists():
        if example_config.exists():
            print("Configuration file not found.")
            print("Creating config.json from config.example.json...")
            
            with open(example_config, 'r') as f:
                config = json.load(f)
            
            with open(config_file, 'w') as f:
                json.dump(config, f, indent=2)
            
            print("✓ Created config.json")
            print("\n⚠️  Please edit config.json and add your API credentials:")
            print("  - Limitless API key")
            print("  - Google Calendar credentials file path")
            print("  - Notion API token and database ID")
            return False
        else:
            print("Error: config.example.json not found")
            return False
    
    print("✓ Configuration file exists")
    return True


def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'httpx',
        'aiohttp',
        'google-auth',
        'google-api-python-client',
        'notion-client'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print("\n⚠️  Missing dependencies:")
        for pkg in missing:
            print(f"  - {pkg}")
        print("\nInstall dependencies with:")
        print("  pip install -r requirements.txt")
        return False
    
    print("✓ All dependencies installed")
    return True


def create_directories():
    """Create necessary directories"""
    dirs = ['logs']
    
    for dir_name in dirs:
        path = Path(dir_name)
        if not path.exists():
            path.mkdir(parents=True)
            print(f"✓ Created directory: {dir_name}")
    
    return True


def main():
    """Main setup function"""
    print("=== Nexus Setup ===\n")
    
    # Check Python version
    if not check_python_version():
        return 1
    print("✓ Python version OK")
    
    # Create directories
    create_directories()
    
    # Check dependencies
    deps_ok = check_dependencies()
    
    # Check configuration
    config_ok = check_config()
    
    print("\n=== Setup Summary ===")
    
    if deps_ok and config_ok:
        print("✓ Setup complete!")
        print("\nYou can now run Nexus with:")
        print("  python main.py")
        return 0
    else:
        print("\n⚠️  Setup incomplete. Please address the issues above.")
        if not deps_ok:
            print("\n1. Install dependencies:")
            print("   pip install -r requirements.txt")
        if not config_ok:
            print("\n2. Configure your API credentials in config.json")
        return 1


if __name__ == '__main__':
    sys.exit(main())
