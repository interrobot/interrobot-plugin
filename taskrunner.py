"""
usage, from base (interrobot-plugin) directory:
$ python taskrunner.py

REQUIRED (python and nodejs)
requires python pip install of libsass, watchdog
requires node npm installs of tsc (npm install -g typescript) 
    and esbuild (npm install -g esbuild)

Watches sass and ts in ./examples/vanillats/ directory for change, and compiles.
The idea here is to replace gulp or grunt (and all that entails) with a  
python file. Since I've removed nodejs taskrunners from all things, quality of 
life has improved. You are, of course, welcome to wire the project together 
however you wish.
"""

import os
import sys
import time
import logging
import shutil
import subprocess
import datetime
from glob import glob

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
LOGGER = logging.getLogger()

try:
    import sass
except ImportError:
    LOGGER.error("python libsass required (pip install libsass)")
    sys.exit()
try:
    from watchdog.observers import Observer
    from watchdog.events import LoggingEventHandler
    from watchdog.events import FileSystemEventHandler
except ImportError:
    LOGGER.error("python watchdog required (pip install watchdog)")
    sys.exit()

# ts project config, passed to tsc compile
TS_INCONFIG = "./tsconfig.examples.json"

# watch directory for ts, modded files trigger compile
TS_PATH = "./examples/vanillats/ts/"
JS_PATH = "./examples/vanillats/js/"

# JS_BUILD_PATH must match output in tsconfig
JS_BUILD_PATH = JS_PATH + "build/"

# watch directory for sass, modded files trigger compile
SASS_PATH = "./examples/vanillats/scss/"
CSS_PATH = "./examples/vanillats/css/"

class TsHandler(FileSystemEventHandler):

    def __init__(self):
        super().__init__()
        self.last_updated = datetime.datetime.now(datetime.UTC)
        self.last_updated_recover = datetime.timedelta(seconds=0.05)
    
    def on_modified(self, event):
        """
        compile and bundle to destination directory
        """
        agnostic_path = event.src_path.replace(os.sep,"/")
        _, agnostic_path_head = os.path.split(agnostic_path)

        if not event.is_directory and agnostic_path_head.endswith(".ts"):
            
            utcnow = datetime.datetime.now(datetime.UTC)
            if utcnow < self.last_updated + self.last_updated_recover:
                LOGGER.info(agnostic_path + " ignored due to 0.05s recovery")
                return
            self.last_updated = utcnow
            LOGGER.info(agnostic_path + " modified, compiling")

            # run compiler
            subprocess.run(["tsc", "--project", TS_INCONFIG], shell=True)

            # run bundler: examples/vanillats/ts/*.js is where the vanillats examples build to
            js_built_examples = glob(JS_BUILD_PATH + "examples/vanillats/ts/*.js")
            print(JS_BUILD_PATH + "examples/vanillats/ts/*.js")
            print(js_built_examples)
            for js_built_example in js_built_examples:
                print(js_built_example)
                js_built_example_path, js_built_example_filename = os.path.split(js_built_example)
                if  js_built_example_filename.endswith(".min.js"):
                    continue
                
                js_bundled_std = JS_PATH + js_built_example_filename
                js_bundled_min = JS_PATH + js_built_example_filename.replace(".js", ".min.js")
                subprocess.run(["esbuild", js_built_example, "--outfile={0}".format(js_bundled_std), "--bundle"], shell=True)
                subprocess.run(["esbuild", js_built_example, "--outfile={0}".format(js_bundled_min), "--bundle", "--minify"], shell=True)
        else:
            LOGGER.info(agnostic_path + " modified")

class SassHandler(FileSystemEventHandler):

    def __init__(self):
        super().__init__()
        self.last_updated = datetime.datetime.now(datetime.UTC)
        self.last_updated_recover = datetime.timedelta(seconds=0.10)
        
    
    def on_modified(self, event):
        """
        get css from sass compile, loop over outfiles and overwrite
        """
        
        agnostic_path = event.src_path.replace(os.sep, "/")
        _, agnostic_path_head = os.path.split(agnostic_path)
        
        if not event.is_directory and event.src_path.endswith(".scss"):            
            utcnow = datetime.datetime.now(datetime.UTC)
            if utcnow < self.last_updated + self.last_updated_recover:
                LOGGER.info(agnostic_path + " ignored due to 0.05s recovery")
                return
            self.last_updated = utcnow
            LOGGER.info(agnostic_path + " modified, compiling")
            # watchdog too fast, stepping on toes, allow to finish modified
            # there is no await
            time.sleep(0.05)
            infiles = glob(SASS_PATH + "*.scss")
            for infile in infiles:
                outfile = infile.replace(".scss", ".css")
                _, outfile_head = os.path.split(outfile)
                try:
                    result_css = sass.compile(filename=infile, output_style='compressed')
                    outpath = CSS_PATH + outfile_head
                    with open(outpath, "wb") as sass_outfile:
                        sass_outfile.write(result_css.encode("utf-8"))
                except sass.CompileError as ex:
                    LOGGER.error(agnostic_path + " failed to compile")
                    LOGGER.info(ex)
        else:
            LOGGER.info(agnostic_path + " modified")
            pass # not scss

if __name__ == "__main__":

    sass_handler = SassHandler()
    sass_observer = Observer()
    sass_observer.schedule(sass_handler, SASS_PATH, recursive=True)
    ts_handler = TsHandler()
    ts_observer = Observer()
    ts_observer.schedule(ts_handler, TS_PATH, recursive=True)
    sass_observer.start()
    ts_observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        sass_observer.stop()
        ts_observer.stop()
    
    ts_observer.join()
    sass_observer.join()
