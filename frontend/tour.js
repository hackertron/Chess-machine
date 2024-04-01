// Create a new instance of the Shepherd class with custom options
const tour = new Shepherd.Tour({
    defaultStepOptions: {
      arrow: true,
      scrollTo: true,
      buttons: [
        {
          text: 'Back',
          action: this.back,
          classes: 'shepherd-button-secondary'
        },
        {
          text: 'Next',
          action: this.next
        }
      ]
    },
    useModalOverlay: true
  });

  // Add the steps to the tour
  tour.addStep({
    title: 'Welcome to ChessBoard',
    text: 'Walkthrough this tutorial to understand how to play',
    attachTo: {
      element: '.title',
      on: 'bottom'
    },
    buttons: [
        {
          text: 'Skip',
          action: tour.cancel,
          classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Main Board',
    text: 'This is the main game board. When your team reach consensus move will be made automatically on this board. This represent actual game between white and black team',
    attachTo: {
      element: '#board1',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Suggestion Board1',
    text: 'This is your board where you will play the move that you want to make on main board. If you have white orientation that means you have to make a move first.',
    attachTo: {
      element: '#board2',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Suggest Move',
    text: 'Whenever you make a move on suggestion board1, you have to submit it so that your teammate can see your suggested move.',
    attachTo: {
      element: '#board2-submit',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Suggestion Board2',
    text: 'This is the board where you will see your teammate\'s suggested move. If orientation is black then you have to wait for your teammate to make a move first.',
    attachTo: {
      element: '#board3',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Submit counter move',
    text: 'Submit the counter move against your teammate here.',
    attachTo: {
      element: '#board3-submit',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Consensus Buttons',
    text: 'Use these buttons to choose which board you agree with. When both teammates agree on same move, move will be made on main board.',
    attachTo: {
      element: '#consensusbox',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

  tour.addStep({
    title: 'Game On !!',
    text: 'Now you are ready to play.',
    attachTo: {
      element: '#consensusbox',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Skip',
        action: tour.cancel,
        classes: 'shepherd-button-secondary'
      },
        {
            text: 'Back',
            action: tour.back,
            classes: 'shepherd-button-secondary'
        },
        {
            text: 'Next',
            action: tour.next
        }
    ]
  });

// Initiate the tour
tour.start()