import time
from mta_client import MTAClient
import config
from rgbmatrix import RGBMatrix, RGBMatrixOptions, graphics

def draw_bullet(canvas, x, y, line_name, is_small=False):
    """Draws a subway line bullet (circle + text)."""
    # Colors
    red = graphics.Color(238, 53, 46)   # 1, 2, 3
    green = graphics.Color(0, 147, 60)  # 4, 5, 6
    purple = graphics.Color(185, 51, 173) # 7
    white = graphics.Color(255, 255, 255)
    
    # Determine color
    bg_color = red
    if line_name in ['4', '5', '6']:
        bg_color = green
    elif line_name == '7':
        bg_color = purple

    if is_small:
        # Small 3x3 dot
        for i in range(3):
            for j in range(3):
                canvas.SetPixel(x + i, y + j, bg_color.red, bg_color.green, bg_color.blue)
        return

    # Large Bullet (Regular)
    radius = 6
    for r in range(radius):
        graphics.DrawCircle(canvas, x + radius, y + radius, r, bg_color)
    graphics.DrawCircle(canvas, x + radius, y + radius, radius, bg_color) # Outline
    
    # Draw Text
    font = graphics.Font()
    font.LoadFont("fonts/4x6.bdf") 
    
    text_x = x + 4
    if len(line_name) > 1: text_x = x + 2
    graphics.DrawText(canvas, font, text_x, y + 9, white, line_name)

def main():
    print("Starting RGB Matrix display application...")

    # --- RGB Matrix Initialization ---
    options = RGBMatrixOptions()
    options.rows = 32
    options.cols = 64
    options.chain_length = 1
    options.parallel = 1
    options.hardware_mapping = 'adafruit-hat'
    options.gpio_slowdown = 4
    options.drop_privileges = False 

    matrix = RGBMatrix(options = options)
    canvas = matrix.CreateFrameCanvas()
    
    # Load Fonts
    font_large = graphics.Font()
    font_large.LoadFont("../rpi-rgb-led-matrix/fonts/6x10.bdf") 
    
    font_small = graphics.Font()
    font_small.LoadFont("../rpi-rgb-led-matrix/fonts/4x6.bdf")

    amber = graphics.Color(255, 184, 28)
    grey = graphics.Color(100, 100, 100)
    
    mta_client = MTAClient()

    try:
        while True:
            current_page_data = mta_client.get_current_page()
            canvas.Clear()

            if current_page_data:
                # --- LEFT SIDE: Top 2 Trains ---
                for i, train in enumerate(current_page_data[:2]):
                    y_offset = i * 16
                    
                    # 1. Rank "1."
                    graphics.DrawText(canvas, font_large, 1, y_offset + 10, grey, f"{train['rank']}.")
                    
                    # 2. Bullet
                    draw_bullet(canvas, 13, y_offset + 1, train['line'], is_small=False)
                    
                    # 3. Time "5 mins"
                    # Number in large font
                    time_val = str(train['time'])
                    graphics.DrawText(canvas, font_large, 29, y_offset + 10, amber, time_val)
                    # " mins" in small font to save space
                    num_width = len(time_val) * 6
                    graphics.DrawText(canvas, font_small, 29 + num_width + 1, y_offset + 10, amber, " mins")

                # --- RIGHT SIDE: List (Rank 3+) ---
                # Shifted further left (start_x = 46) and made taller (y_pos = i * 7)
                start_x = 46
                for i, train in enumerate(current_page_data[2:]):
                    y_pos = i * 7 # Increased height from 6 to 7
                    if y_pos > 25: break 

                    # Rank
                    graphics.DrawText(canvas, font_small, start_x, y_pos + 5, grey, str(train['rank']))
                    
                    # Small Bullet (3x3)
                    draw_bullet(canvas, start_x + 5, y_pos + 1, train['line'], is_small=True)
                    
                    # Time (Append 'm')
                    graphics.DrawText(canvas, font_small, start_x + 9, y_pos + 5, amber, f"{train['time']}m")

            else:
                graphics.DrawText(canvas, font_large, 4, 20, graphics.Color(255, 0, 0), "NO TRAINS")

            canvas = matrix.SwapOnVSync(canvas)
            time.sleep(config.PAGE_DURATION)


    except KeyboardInterrupt:
        print("Exiting application.")
        matrix.Clear()

if __name__ == "__main__":
    main()
