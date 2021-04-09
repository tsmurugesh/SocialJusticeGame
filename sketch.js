/***********************************************************************************
  MoodyMaze
  by Scott Kildall

  Uses the p5.2DAdventure.js class 
  
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// adventure manager global  
var adventureManager;

// p5.play
var playerSprite;
var playerAnimation;

// Clickables: the manager class
var clickablesManager; // the manager class
var clickables; // an array of clickable objects
// indexes into the clickable array (constants)



// some globals we use throughout...
var talkedToWeirdNPC = false;

// indexes into the clickable array (constants)
const playGameIndex = 0;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
    clickablesManager = new ClickableManager('data/clickableLayout.csv');
    adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');
}

// Setup the adventure manager
function setup() {
    createCanvas(960, 720);

    // setup the clickables = this will allocate the array
    clickables = clickablesManager.setup();

    // create a sprite and add the 3 animations
    playerSprite = createSprite(width / 2, height / 2, 80, 80);

    // every animation needs a descriptor, since we aren't switching animations, this string value doesn't matter
    playerSprite.addAnimation('regular', loadAnimation('assets/avatars/child1.png', 'assets/avatars/child4.png'));


    // use this to track movement from toom to room in adventureManager.draw()
    adventureManager.setPlayerSprite(playerSprite);

    // this is optional but will manage turning visibility of buttons on/off
    // based on the state name in the clickableLayout
    adventureManager.setClickableManager(clickablesManager);

    // This will load the images, go through state and interation tables, etc
    adventureManager.setup();

    // call OUR function to setup additional information about the p5.clickables
    // that are not in the array 
    setupClickables();
}

// Adventure manager handles it all!
function draw() {
    // draws background rooms and handles movement from one to another
    adventureManager.draw();

    // draw the p5.clickables, in front of the mazes but behind the sprites 
    clickablesManager.draw();

    // No avatar for Splash screen or Instructions screen
    if (adventureManager.getStateName() !== "Splash" &&
        adventureManager.getStateName() !== "Instructions" &&
        adventureManager.getStateName() !== "Instructions2" ) {

        // responds to keydowns
        moveSprite();

        // this is a function of p5.js, not of this sketch
        drawSprite(playerSprite);
    }
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
    // toggle fullscreen mode
    if (key === 'f') {
        fs = fullscreen();
        fullscreen(!fs);
        return;
    }

    // dispatch key events for adventure manager to move from state to 
    // state or do special actions - this can be disabled for NPC conversations
    // or text entry   

    // dispatch to elsewhere
    adventureManager.keyPressed(key);
}

function mouseReleased() {
    adventureManager.mouseReleased();
}

//-------------- YOUR SPRITE MOVEMENT CODE HERE  ---------------//
function moveSprite() {
    if (keyIsDown(RIGHT_ARROW))
        playerSprite.velocity.x = 10;
    else if (keyIsDown(LEFT_ARROW))
        playerSprite.velocity.x = -10;
    else
        playerSprite.velocity.x = 0;

    if (keyIsDown(DOWN_ARROW))
        playerSprite.velocity.y = 10;
    else if (keyIsDown(UP_ARROW))
        playerSprite.velocity.y = -10;
    else
        playerSprite.velocity.y = 0;
}

//-------------- CLICKABLE CODE  ---------------//

function setupClickables() {
    // All clickables to have same effects
    for (let i = 0; i < clickables.length; i++) {
        clickables[i].onHover = clickableButtonHover;
        clickables[i].onOutside = clickableButtonOnOutside;
        clickables[i].onPress = clickableButtonPressed;
    }
}

// tint when mouse is over
clickableButtonHover = function () {
    this.color = "#d1bfb1";
    this.noTint = false;
    this.tint = "#d1bfb1";
}

// color a light gray if off
clickableButtonOnOutside = function () {
    // backto our gray color
    this.color = "#FFF";
}

clickableButtonPressed = function () {
    // these clickables are ones that change your state
    // so they route to the adventure manager to do this
    adventureManager.clickablePressed(this.name);
}

function talkToWeirdy() {
    if (talkedToWeirdNPC === false) {
        print("turning them on");

        //    // turn on visibility for buttons
        //    for( let i = answer1Index; i <= answer6Index; i++ ) {
        //      clickables[i].visible = true;
        //    }

        talkedToWeirdNPC = true;
        print("talked to weidy");
    }
}




//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//


// Instructions screen has a backgrounnd image, loaded from the adventureStates table
// It is sublcassed from PNGRoom, which means all the loading, unloading and drawing of that
// class can be used. We call super() to call the super class's function as needed
class InstructionsScreen extends PNGRoom {
    // preload is where we define OUR variables
    // Best not to use constructor() functions for sublcasses of PNGRoom
    // AdventureManager calls preload() one time, during startup
    preload() {
        // These are out variables in the InstructionsScreen class
        this.textBoxWidth = (width / 6) * 4;
        this.textBoxHeight = (height / 6) * 4;

        // hard-coded, but this could be loaded from a file if we wanted to be more elegant
        this.instructionsText = "You are navigating through 3 stages of life of a young girl who realizes she is a lesbian. In each stage you will be able tot alk to various npcs that prompt you to think about her situation. You will also be able to enter her thoughts and view the internal struggles she faces at each stage of her life.";
    }

    // call the PNGRoom superclass's draw function to draw the background image
    // and draw our instructions on top of this
    draw() {
        // tint down background image so text is more readable
        tint(128);

        // this calls PNGRoom.draw()
        super.draw();

        // text draw settings
        fill(255);
        textAlign(CENTER);
        textSize(30);

        // Draw text in a box
        text(this.instructionsText, width / 6, height / 6, this.textBoxWidth, this.textBoxHeight);
    }
}


//---park  testing npc --//
class ParkRoom extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    // 
    preload() {
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false; // only draw when we run into it
        talkedToWeirdNPC = false;

        // NPC position
        this.drawX = width / 4;
        this.drawY = height / 2 + 100;

        // load the animation just one time
        this.NPC1 = createSprite(this.drawX, this.drawY, 100, 100);
        this.NPC1.addAnimation('regular', loadAnimation('assets/avatars/child1.png', 'assets/avatars/child4.png'));
        
        
        // randomly places npcs pf this group all over, nothing happens when interacted
        
        this.NPCAnimation = loadAnimation('assets/NPCs/teacherNPC1.png', 'assets/NPCs/teacherNPC2.png');

        // this is a type from p5play, so we can do operations on all sprites
        // at once
        this.NPCgroup = new Group;

        // change this number for more or less
        this.numNPCs = 3;

        // is an array of sprites, note we keep this array because
        // later I will add movement to all of them
        this.NPCSprites = [];

        // this will place them randomly in the room
        for (let i = 0; i < this.numNPCs; i++) {
            // random x and random y poisiton for each sprite
            let randX = random(100, width - 100);
            let randY = random(100, height - 100);

            // create the sprite
            this.NPCSprites[i] = createSprite(randX, randY, 40, 40);

            // add the animation to it (important to load the animation just one time)
            this.NPCSprites[i].addAnimation('regular', this.NPCAnimation);

            // add to the group
            this.NPCgroup.add(this.NPCSprites[i]);
        }

    }

    load() {
        // pass to superclass
        super.load();

        this.talkBubble = loadImage('assets/talkBubble.png');

        //      // turn off buttons
        //      for( let i = answer1Index; i <= answer6Index; i++ ) {
        //       clickables[i].visible = false;
        //      }
    }

    // clears up memory
    unload() {
        super.unload();

        this.talkBubble = null;
        talkedToWeirdNPC = false;
        print("unloading AHA room");
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        // draws all the sprites in the group
        //this.weirdNPCSprite.draw();
        this.NPCgroup.draw();
        drawSprite(this.NPC1)
        // draws all the sprites in the group - 
        //drawSprites(this.weirdNPCgroup);//.draw();

        // checks for overlap with ANY sprite in the group, if this happens
        // talk() function gets called
        playerSprite.overlap(this.NPC1, talkToWeirdy);


        if (this.talkBubble !== null && talkedToWeirdNPC === true) {
            image(this.talkBubble, this.drawX + 60, this.drawY - 350);
        }
    }
}

//---child classroom testing npc --//
class ChildSchoolRoom extends PNGRoom {
    // preload() gets called once upon startup
    // We load ONE animation and create 20 NPCs
    // 
    preload() {
        // this is our image, we will load when we enter the room
        this.talkBubble = null;
        this.talkedToNPC = false; // only draw when we run into it
        talkedToWeirdNPC = false;

        // NPC position
        this.drawX = width / 4 + 100;
        this.drawY = height / 2 - 40;

        // load the animation just one time
        this.NPC1 = createSprite(width / 4 + 100, height / 2 - 40, 100, 100);
        this.NPC1.addAnimation('regular', loadAnimation('assets/NPCs/teacherNPC1.png', 'assets/NPCs/teacherNPC2.png'));
        
        
        this.NPC2 = createSprite(width-100, height/2, 100, 100);
        this.NPC2.addAnimation('regular', loadAnimation('assets/avatars/child1.png', 'assets/avatars/child4.png'));


    }

    load() {
        // pass to superclass
        super.load();

        this.talkBubble = loadImage('assets/talkBubble.png');

        //      // turn off buttons
        //      for( let i = answer1Index; i <= answer6Index; i++ ) {
        //       clickables[i].visible = false;
        //      }
    }

    // clears up memory
    unload() {
        super.unload();

        this.talkBubble = null;
        talkedToWeirdNPC = false;
        print("unloading AHA room");
    }

    // pass draw function to superclass, then draw sprites, then check for overlap
    draw() {
        // PNG room draw
        super.draw();

        // draws all the sprites in the group
        //this.weirdNPCSprite.draw();
        drawSprite(this.NPC1)
        drawSprite(this.NPC2)
        // draws all the sprites in the group - 
        //drawSprites(this.weirdNPCgroup);//.draw();

        // checks for overlap with ANY sprite in the group, if this happens
        // talk() function gets called
        playerSprite.overlap(this.NPC1, talkToWeirdy);


        if (this.talkBubble !== null && talkedToWeirdNPC === true) {
            image(this.talkBubble, this.drawX + 60, this.drawY - 350);
        }
    }
}
