import os
import glob
from rembg import remove
from PIL import Image

def main():
    character_dir = r"C:\Users\ali\.gemini\antigravity\worktrees\Visual Novel\fix-character-png-transparency\frontend\assets\characters"
    
    # Find all PNG files
    png_files = glob.glob(os.path.join(character_dir, "*.png"))
    
    if not png_files:
        print("No PNG files found in the directory.")
        return
        
    for file_path in png_files:
        print(f"Processing: {file_path}")
        
        try:
            # Read image
            input_image = Image.open(file_path)
            
            # Remove background
            output_image = remove(input_image)
            
            # Save the image, overwriting the original
            output_image.save(file_path)
            print(f"Successfully processed and saved: {os.path.basename(file_path)}")
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

if __name__ == "__main__":
    main()
