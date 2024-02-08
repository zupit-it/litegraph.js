# Contribution Rules
There are some simple rules that everyone should follow:

### Do not commit files from build folder
> I usually have horrible merge conflicts when I upload the build version that take me too much time to solve, but I want to keep the build version in the repo, so I guess it would be better if only one of us does the built, which would be me.
> https://github.com/jagenjo/litegraph.js/pull/155#issuecomment-656602861
Those files will be updated by owner.


# Development

## Prerequisites
- [Node.js](https://nodejs.org/en/) Tested with Node v18.16.0
- [Python](https://www.python.org/downloads/) Tested with Python 3.11.6

## Setup
1. Clone the repository
2. Install the dependencies
```bash
npm install
```

## Build
Run the following command to build the project
```bash
cd utils
./build.sh
```

You should find all the build files in the `build` folder.