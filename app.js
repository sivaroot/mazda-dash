/**
 * [mz_dash]
 *
 * @version: 0.0.1
 * @author: Sivaroot Chuncharoen
 * @description [description]
 *
 * [license]
 */

/**
 * Custom Application
 */

CustomApplicationsHandler.register(
  "app.mz_dash",
  new CustomApplication({
    /**
     * (require)
     *
     * An object array that defines resources to be loaded such as javascript's, css's, images, etc
     *
     * All resources are relative to the applications root path
     */

    require: {
      /**
       * (js) defines javascript includes
       */

      js: [],

      /**
       * (css) defines css includes
       */

      css: ["app.css"],

      /**
       * (images) defines images that are being preloaded
       *
       * Images are assigned to an id, e.g. {coolBackground: 'images/cool-background.png'}
       */

      images: {},
    },

    /**
     * (settings)
     *
     * An object that defines application settings
     */

    settings: {
      /**
       * (title) The title of the application in the Application menu
       */

      title: "mz_dash",

      /**
       * (statusbar) Defines if the statusbar should be shown
       */

      statusbar: false,

      /**
       * (statusbarIcon) defines the status bar icon
       *
       * Set to true to display the default icon app.png or set a string to display
       * a fully custom icon.
       *
       * Icons need to be 37x37
       */

      statusbarIcon: true,

      /**
       * (statusbarTitle) overrides the statusbar title, otherwise title is used
       */

      statusbarTitle: false,

      /**
       * (statusbarHideHomeButton) hides the home button in the statusbar
       */

      // statusbarHideHomeButton: false,

      /**
       * (hasLeftButton) indicates if the UI left button / return button should be shown
       */

      hasLeftButton: false,

      /**
       * (hasMenuCaret) indicates if the menu item should be displayed with an caret
       */

      hasMenuCaret: false,

      /**
       * (hasRightArc) indicates if the standard right arc should be displayed
       */

      hasRightArc: false,
    },

    /***
     *** Application Life Cycles
     ***/

    /**
     * (created)
     *
     * Executed when the application is initialized for the first time. Once an application is
     * initialized it always keeps it's current state even the application is not displayed.
     *
     * Usually you want to initialize your user interface here and generate all required DOM Elements.
     *
     *
     * @event
     * @return {void}
     */

    created: function () {
      this.mainContainer = $("<div/>")
        .addClass("main-container")
        .appendTo(this.canvas);

      this.vehicleSpeedValue = $("<div/>")
        .addClass("vehicle-speed-value")
        .html(250)
        .appendTo(this.canvas);

      this.transmissionPositionValue = $("<div/>")
        .addClass("transmission-value")
        .appendTo(this.canvas);

      this.engineSpeedIndicator = $("<div/>")
        .addClass("engine-indicator")
        .appendTo(this.canvas);

      this.datetimeContainer = $("<div/>")
        .addClass("datetime-container")
        .appendTo(this.canvas);

      this.time = $("<div/>").addClass("time").appendTo(this.datetimeContainer);
      this.date = $("<div/>").addClass("date").appendTo(this.datetimeContainer);

      this.subscribeVehicleSpeed();
      this.subscribeEngineSpeed();
      this.subscribeTransmissionPosition();
      this.subscribeGPSTime();
    },

    subscribeGPSTime: function () {
      var subscribeId = "gpstimestamp";
      this.subscribe(
        subscribeId,
        function (value) {
          var datetime = new Date(value * 1000);
          var hours = datetime.getHours(),
            minutes = datetime.getMinutes();
          datetime.setHours(datetime.getHours() - 5);
          if (datetime.getHours() < 10) {
            hours = `0${hours}`;
          }
          if (minutes < 10) {
            minutes = `0${minutes}`;
          }
          this.time.html(
            datetime.toLocaleTimeString("en", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          this.date.html(
            datetime.toLocaleDateString("en", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })
          );
        }.bind(this)
      );
    },

    subscribeTransmissionPosition: function () {
      var subscribeId = "vdtctransmchangeleverposition";
      this.subscribe(
        subscribeId,
        function (value) {
          var positions = ["P", "R", "N", "D"];
          this.transmissionPositionValue.html(positions[value - 1]);
        }.bind(this)
      );
    },

    subscribeTransmissionPosition: function () {
      var subscribeId = "vdtctransmchangeleverposition";
      this.subscribe(
        subscribeId,
        function (value) {
          var positions = ["P", "R", "N", "D"];
          var indexPosition = value - 1;
          if (indexPosition === 3) {
            this.transmissionPositionValue.css("color", "#2BFF73");
          }
          this.transmissionPositionValue.html(positions[indexPosition]);
        }.bind(this)
      );
    },

    subscribeVehicleSpeed: function () {
      this.subscribe(
        VehicleData.vehicle.speed,
        function (value) {
          if (value < 10) {
            this.vehicleSpeedValue.css("left", "254px");
          } else if (value < 100) {
            this.vehicleSpeedValue.css("left", "243.5px");
          } else {
            this.vehicleSpeedValue.css("left", "233px");
          }
          this.vehicleSpeedValue.html(value);
        }.bind(this)
      );
    },

    subscribeEngineSpeed: function () {
      this.subscribe(
        VehicleData.vehicle.rpm,
        function (value) {
          var angleRange = 270;
          var maxValueRange = 6000;
          var angleCurrent = (angleRange / maxValueRange) * value - 67.5;
          if (value > maxValueRange) {
            angleCurrent = 202.5;
          }

          this.engineSpeedIndicator.css(
            "transform",
            `rotate(${angleCurrent}deg)`
          );
        }.bind(this)
      );
    },

    /**
     * (focused)
     *
     * Executes when the application gets displayed on the Infotainment display.
     *
     * You normally want to start your application workflow from here and also recover the app from any
     * previous state.
     *
     * @event
     * @return {void}
     */

    focused: function () {},

    /**
     * (lost)
     *
     * Lost is executed when the application is being hidden.
     *
     * Usually you want to add logic here that stops your application workflow and save any values that
     * your application may require once the focus is regained.
     *
     * @event
     * @return {void}
     */

    lost: function () {},

    /**
     * (terminated)
     *
     * Usually you never implement this lifecycle event. Your custom application stays alive and keeps it's
     * state during the entire runtime of when you turn on your Infotainment until you turn it off.
     *
     * This has two advantages: First all of your resources (images, css, videos, etc) all need to be loaded only
     * once and second while you wander through different applications like the audio player, your application
     * never needs to be reinitialized and is just effectivily paused when it doesn't have the focus.
     *
     * However there are reasons, which I can't think any off, that your application might need to be
     * terminated after each lost lifecyle. You need to add {terminateOnLost: true} to your application settings
     * to enable this feature.
     *
     * @event
     * @return {void}
     */

    terminated: function () {},

    /***
     *** Application Events
     ***/

    /**
     * (event) onContextEvent
     *
     * Called when the context of an element was changed
     *
     * The eventId might be either FOCUSED or LOST. If FOCUSED, the element has received the
     * current context and if LOST, the element's context was removed.
     *
     * @event
     * @param {string} eventId - The eventId of this event
     * @param {object} context - The context of this element which defines the behavior and bounding box
     * @param {JQueryElement} element - The JQuery DOM node that was assigned to this context
     * @return {void}
     */

    onContextEvent: function (eventId, context, element) {
      switch (eventId) {
        /**
         * The element received the focus of the current context
         */

        case this.FOCUSED:
          break;

        /**
         * The element lost the focus
         */

        case this.LOST:
          break;
      }
    },

    /**
     * (event) onControllerEvent
     *
     * Called when a new (multi)controller event is available
     *
     * @event
     * @param {string} eventId - The Multicontroller event id
     * @return {void}
     */

    onControllerEvent: function (eventId) {
      switch (eventId) {
        /*
         * MultiController was moved to the left
         */
        case this.LEFT:
          break;

        /*
         * MultiController was moved to the right
         */
        case this.RIGHT:
          break;

        /*
         * MultiController was moved up
         */
        case this.UP:
          break;

        /*
         * MultiController was moved down
         */
        case this.DOWN:
          break;

        /*
         * MultiController Wheel was turned clockwise
         */
        case this.CW:
          break;

        /*
         * MultiController Wheel was turned counter-clockwise
         */
        case this.CCW:
          break;

        /*
         * MultiController's center was pushed down
         */
        case this.SELECT:
          break;

        /*
         * MultiController hot key "back" was pushed
         */
        case this.BACK:
          break;
      }
    },
  })
); /** EOF **/
