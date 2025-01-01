import re
from pathlib import Path
import os

def convert_absolute_to_relative(source_path: Path, absolute_path: str) -> str:
    """Convert an absolute path to a relative path based on the source file location."""
    # Remove leading slash to make it relative to the root
    target_path = Path(absolute_path.lstrip('/'))
    
    # Get the relative path from source directory to target
    relative_path = os.path.relpath(target_path, source_path.parent)
    
    return relative_path

def process_file(file_path: Path) -> None:
    """Process a single markdown file and convert absolute links to relative."""
    content = file_path.read_text()
    
    # Regular expression to find markdown links
    pattern = r'\[([^\]]+)\]\((/[^)]+)\)'
    
    def replace_link(match):
        link_text = match.group(1)
        absolute_path = match.group(2)
        relative_path = convert_absolute_to_relative(file_path, absolute_path)
        return f'[{link_text}]({relative_path})'
    
    new_content = re.sub(pattern, replace_link, content)
    
    # Only write if content has changed
    if new_content != content:
        print(f"Updating {file_path}")
        file_path.write_text(new_content)

def main():
    # Find all markdown files in current directory and subdirectories
    root_dir = Path('.')
    markdown_files = list(root_dir.rglob('*.md')) + list(root_dir.rglob('*.mdx'))
    
    for file_path in markdown_files:
        process_file(file_path)

if __name__ == '__main__':
    main()

