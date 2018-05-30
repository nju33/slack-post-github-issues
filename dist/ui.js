"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = void 0;

var _ink = require("ink");

var _pad = _interopRequireDefault(require("pad"));

var _cliClear = _interopRequireDefault(require("cli-clear"));

var _keypress = _interopRequireDefault(require("keypress"));

var _termSize = _interopRequireDefault(require("term-size"));

var _figures = _interopRequireDefault(require("figures"));

var _events = _interopRequireDefault(require("events"));

var _lodash = _interopRequireDefault(require("lodash"));

var _got = _interopRequireDefault(require("got"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const ev = new _events.default(); // class Counter extends Component {
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

    _defineProperty(this, "keypressJ", () => {
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
    });

    _defineProperty(this, "keypressK", () => {
      if (this.isIssueAreaActive()) {
        if (this.state.cursor > 0) {
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
    });

    _defineProperty(this, "maybeIntoRepoArea", () => {
      this.setState({
        area: 'repo',
        cursor: -1
      });
    });

    _defineProperty(this, "maybeIntoIssueArea", () => {
      this.setState({
        area: 'issue',
        cursor: 0
      });
    });

    _defineProperty(this, "keypressSpace", () => {
      if (!this.isIssueAreaActive()) {
        return;
      }

      const {
        choicedIssues
      } = this.state;
      const targetIssue = this.items[this.state.cursor];
      const index = choicedIssues.findIndex(item => item === targetIssue);

      if (index === -1) {
        choicedIssues.push(targetIssue);
      } else {
        choicedIssues.splice(index, 1);
      }

      this.setState({
        choicedIssues
      });
    });

    _defineProperty(this, "keypressReturn", () => {
      ev.emit('unmount', this.state.choicedIssues);
    });

    if (props.repositories.length === 0) {
      return;
    }

    const reponameMaxLength = props.repositories.reduce((result, repo) => {
      return result > repo.length ? result : repo.length;
    }, 0);
    this.state = {
      area: 'repo',
      size: (0, _termSize.default)(),
      selectedRepo: props.repositories[0],
      // selectedIssues: [],
      cursor: -1,
      choicedIssues: props.choicedIssues || [],
      reponameMaxLength
    };
  }

  isIssueAreaActive() {
    return this.state.area === 'issue';
  }

  get items() {
    return this.props.grouped[this.state.selectedRepo.trim()];
  }

  getRepoText(completedRepo) {
    return (0, _pad.default)(completedRepo, 25);
  }

  getIssueTitle(issue, selected = false) {
    if (selected) {
      return ' ✓ ' + (issue || {
        issueTitle: ''
      }).issueTitle.slice(0, 48);
    }

    return (issue || {
      issueTitle: ''
    }).issueTitle.slice(0, 48);
  }

  getRepoGap(selected) {
    if (selected) {
      return (0, _ink.h)(_ink.Color, {
        blue: true
      }, _figures.default.pointer);
    }

    return (0, _ink.h)(_ink.Color, {
      hidden: true
    }, _figures.default.pointer);
  }

  getRepoText(selected, text) {
    if (selected) {
      return (0, _ink.h)(_ink.Color, null, (0, _pad.default)(text, this.state.reponameMaxLength) || (0, _pad.default)(' ', this.state.reponameMaxLength));
    }

    return (0, _ink.h)(_ink.Color, {
      gray: true
    }, (0, _pad.default)(text, this.state.reponameMaxLength) || (0, _pad.default)(' ', this.state.reponameMaxLength));
  }

  getIssueGap(choiced) {
    if (choiced) {
      return (0, _ink.h)(_ink.Color, {
        blue: true
      }, _figures.default.tick);
    }

    return (0, _ink.h)(_ink.Color, {
      blue: true,
      hidden: true
    }, _figures.default.tick);
  }

  getIssueText(choiced, target, text) {
    let colorProps = {
      white: true
    };

    if (choiced) {
      colorProps = {
        bgBlue: true,
        black: true
      };
    }

    if (target) {
      colorProps = {
        bgBlue: true,
        black: true
      };
    }

    return (0, _ink.h)(_ink.Color, colorProps, text || Ui.issueFullPad);
  }

  getRepositoryByIndex(index) {
    return this.props.repositories[index];
  }

  getIssueByIndex(index) {
    return this.items[index];
  }

  isSelectedRepo(repo) {
    return this.state.selectedRepo === repo;
  }

  isChoicedIssue(issue) {
    return this.state.choicedIssues.includes(issue);
  }

  isTargetIssue(issue, lineNumber) {
    return this.items[lineNumber] === issue;
  }

  get header() {
    return (0, _ink.h)("div", null, (0, _ink.h)(_ink.Color, {
      gray: true
    }, (0, _pad.default)('', this.state.size.columns, '-')));
  }

  get footer() {
    return (0, _ink.h)("div", null, (0, _ink.h)("div", null, (0, _ink.h)(_ink.Color, {
      gray: true
    }, (0, _pad.default)('', this.state.size.columns, '-'))), (0, _ink.h)("div", null, (0, _ink.h)(_ink.Color, {
      gray: true
    }, _figures.default.arrowLeft, " ", _figures.default.arrowUp, " ", _figures.default.arrowDown, ' ', _figures.default.arrowRight, " ", '[space]', " ", '[enter]')));
  }

  render() {
    let lines = [];
    let i = 0;

    while (i < this.state.size.rows) {
      let repo = this.getRepositoryByIndex(i);
      let issue = this.getIssueByIndex(i);

      if (typeof repo === 'undefined' && typeof issue === 'undefined') {
        break;
      }

      if (typeof repo === 'undefined') {
        repo = '';
      }

      if (typeof issue === 'undefined') {
        issue = {};
      }

      const selectedRepo = this.isSelectedRepo(repo);
      const repoGap = this.getRepoGap(selectedRepo);
      const repoText = this.getRepoText(selectedRepo, repo.trim());
      const choicedIssue = this.isChoicedIssue(issue);
      const targetIssue = this.isTargetIssue(issue, this.state.cursor); // const issueGap = this.getIssueGap(choicedIssue);

      const issueText = this.getIssueText(choicedIssue, targetIssue, issue.issueTitle);
      lines.push((0, _ink.h)("div", {
        key: i
      }, repoGap, repoText, (0, _ink.h)(_ink.Color, {
        gray: true
      }, " | "), issueText));
      i = i + 1;
    }

    return (0, _ink.h)("div", null, this.header, lines, this.footer);
  }

  componentDidMount() {
    process.stdout.on('resize', function () {
      this.setState({
        size: (0, _termSize.default)()
      });
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'j') {
        this.keypressJ();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'k') {
        this.keypressK();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'h') {
        this.maybeIntoRepoArea();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      // console.log('got "keypress"', key);
      if (key && key.name == 'l') {
        this.maybeIntoIssueArea();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      if (key && key.name == 'space') {
        this.keypressSpace();
      }
    });
    process.stdin.on('keypress', (ch, key) => {
      if (key && key.name == 'return') {
        this.keypressReturn();
      }
    });
    this.forceUpdate();
  }

}

_defineProperty(Ui, "repoTextPad", 25);

_defineProperty(Ui, "repoFullPad", (0, _pad.default)(' ', Ui.repoTextPad));

_defineProperty(Ui, "issueFullPad", (0, _pad.default)(' ', 50));

const render = ({
  argv,
  slack,
  repositories,
  grouped,
  choicedIssues
}, format) => {
  setTimeout(() => {
    const unmount = (0, _ink.render)((0, _ink.h)(Ui, {
      repositories: repositories || [],
      grouped: grouped,
      choicedIssues: choicedIssues
    }));
    ev.on('unmount', async result => {
      unmount();

      if (format === 'slack') {
        const grouped = _lodash.default.groupBy(result, issue => issue.repository);

        const data = {
          token: argv.slackToken,
          channel: argv.slackChannel,
          as_user: true,
          attachments: JSON.stringify(_lodash.default.flatten(Object.keys(grouped).map(repository => {
            return grouped[repository].map(issue => {
              return {
                color: issue.history ? '#81888c' : '#2ea9df',
                title: issue.issueTitle,
                title_link: issue.url,
                footer: JSON.stringify({
                  repository: issue.repository,
                  id: issue.id
                })
              };
            });
          })))
        };
        await _got.default.post('https://slack.com/api/chat.postMessage', {
          query: data
        });

        if (slack.isToday()) {
          await slack.deleteLatestMessage();
        }
      } else {
        throw new Error('不明なフォーマット');
      }

      process.exit(0);
    });
  }, 1000);
};

exports.render = render;