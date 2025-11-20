import sys

try:
    from app import create_app
    app = create_app()
except Exception as e:
    print(f"CRITICAL ERROR: Failed to create app: {e}", file=sys.stderr)
    raise

if __name__ == '__main__':
    app.run(debug=True)
