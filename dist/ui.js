"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = void 0;

var _ink = require("ink");

var _pad = _interopRequireDefault(require("pad"));

var _cliClear = _interopRequireDefault(require("cli-clear"));

var _keypress = _interopRequireDefault(require("keypress"));

var _windowSize = _interopRequireDefault(require("window-size"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// class Counter extends Component {
//   constructor() {
//     super();
//     this.state = {
//       i: 0
//     };
//   }
//   render() {
//     return <Color green>{this.state.i} tests passed</Color>;
//   }
//   componentDidMount() {
//     this.timer = setInterval(() => {
//       this.setState({
//         i: this.state.i + 1
//       });
//     }, 100);
//   }
//   componentWillUnmount() {
//     clearInterval(this.timer);
//   }
// }
class Ui extends _ink.Component {
  constructor(props) {
    super(props);

    if (props.repositories.length === 0) {
      return;
    }

    this.state = {
      area: 'repo',
      size: _windowSize.default.get(),
      selectedRepo: props.repositories[0],
      cursor: 0,
      choiceIssues: []
    };
  }

  isIssueAreaActive() {
    return this.state.area === 'issue';
  }

  get items() {
    // console.log(this.props.grouped[this.state.selectedRepo.trim()])
    return this.props.grouped[this.state.selectedRepo.trim()];
  }

  getIssueTitle(issue) {
    return (issue || {
      issueTitle: ''
    }).issueTitle.slice(0, 48);
  }

  render() {
    return (0, _ink.h)("div", null, ([...this.props.repositories] || []).map((repo, i) => {
      if (this.state.selectedRepo === repo) {
        return (0, _ink.h)("div", {
          key: repo
        }, (0, _ink.h)(_ink.Color, {
          blue: true
        }, '*' + repo), ' ', this.isIssueAreaActive() && this.state.cursor === i ? (0, _ink.h)(_ink.Color, {
          bgWhite: true,
          white: true
        }, "this.getIssueTitle(this.items[i])") : this.getIssueTitle(this.items[i]));
      }

      return (0, _ink.h)("div", {
        key: repo
      }, repo, ' ', this.isIssueAreaActive() && this.state.cursor === i ? (0, _ink.h)(_ink.Color, {
        bgWhite: true,
        black: true
      }, "this.getIssueTitle(this.items[i])") : this.getIssueTitle(this.items[i]));
    }), this.props.repositories.length < this.items.length && this.items.slice(this.props.repositories.length - 1).map(item => {
      return (0, _ink.h)("div", {
        key: item.id
      }, (0, _pad.default)(25, '') + ' ' + this.getIssueTitle(item));
    }));
  }

  componentDidMount() {
    process.stdout.on('resize', function () {
      this.setState({
        size: _windowSize.default.get()
      });
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'j') {
        this.maybeSelectNextRepo();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'k') {
        this.maybeSelectPrevRepo();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'l') {
        this.maybeIntoIssueArea();
      }
    });
    this.forceUpdate();
  }

  maybeSelectNextRepo() {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor < this.items.length - 1) {
        this.setState({
          cursor: this.state.cursor + 1
        });
      }

      return;
    }

    const currentIndex = this.props.repositories.findIndex(repo => repo === this.state.selectedRepo);

    if (currentIndex === this.props.repositories.length - 1) {
      return;
    }

    this.setState({
      selectedRepo: this.props.repositories[currentIndex + 1]
    });
  }

  maybeSelectPrevRepo() {
    if (this.isIssueAreaActive()) {
      if (this.state.cursor > 1) {
        this.setState({
          cursor: this.state.cursor - 1
        });
      }

      return;
    }

    const currentIndex = this.props.repositories.findIndex(repo => repo === this.state.selectedRepo);

    if (currentIndex === 0) {
      return;
    }

    this.setState({
      selectedRepo: this.props.repositories[currentIndex - 1]
    });
  }

  maybeIntoIssueArea() {
    this.setState({
      area: 'issue',
      cursor: 0
    });
  }

}

const render = ({
  repositories,
  grouped
}) => {
  setTimeout(() => {
    (0, _ink.render)((0, _ink.h)(Ui, {
      repositories: repositories || [],
      grouped: grouped
    }));
  }, 1000);
};

exports.render = render;