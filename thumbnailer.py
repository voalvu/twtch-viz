import os
from PIL import Image

def create_thumbnails(input_folder, output_folder, size=(30, 30)):
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Iterate through all files in the input folder
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
            # Construct full file path
            file_path = os.path.join(input_folder, filename)
            # Open an image file
            try:
                with Image.open(file_path) as img:
                    # Create a thumbnail
                    img.thumbnail(size)

                    # Check the mode and convert if necessary
                    if img.mode == 'RGBA':
                        # Convert to RGB (removing alpha channel)
                        img = img.convert('RGB')

                    # Save the thumbnail to the output folder
                    thumbnail_path = os.path.join(output_folder, filename)

                    # If saving as JPEG, ensure the file extension is .jpg
                    if filename.lower().endswith('.png') or filename.lower().endswith('.gif'):
                        thumbnail_path = os.path.splitext(thumbnail_path)[0] + '.jpg'

                    img.save(thumbnail_path)
                    print(f"Thumbnail saved: {thumbnail_path}")
            except:
                print('fAIL')



if __name__ == '__main__':
    input_folder = '.'  # Change this to your input folder
    output_folder = './thumbnails'  # Output folder for thumbnails
    create_thumbnails(input_folder, output_folder)

