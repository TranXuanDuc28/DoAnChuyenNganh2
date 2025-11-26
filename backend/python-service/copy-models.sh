#!/bin/bash
# Bash script to copy ML models from source directory

SOURCE_PATH="../../Personalized-Health-and-Fitness-Recommendation-System/Pycharm Files"
DEST_PATH="."

echo "Copying ML models from $SOURCE_PATH to $DEST_PATH..."

# Check if source directory exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo "Error: Source directory not found: $SOURCE_PATH"
    exit 1
fi

# Copy model files
FILES=(
    "rf_diet_model.pkl"
    "rf_exercises_model.pkl"
    "label_encoders.pkl"
)

for file in "${FILES[@]}"; do
    source_file="$SOURCE_PATH/$file"
    dest_file="$DEST_PATH/$file"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$dest_file"
        echo "✓ Copied $file"
    else
        echo "✗ File not found: $file"
    fi
done

echo ""
echo "Done! ML models copied successfully."
echo "You can now run: python app.py"

