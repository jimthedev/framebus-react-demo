import React from "react";
import { render } from "react-dom";
import FlipMove from "react-flip-move";
var bus = require("framebus");
const uuidv1 = require("uuid/v1");

const innerTarget = "https://localhost:3000";

const outerTarget = "https://localhost:3001";

const targets = {
  [outerTarget]: "outer",
  [innerTarget]: "inner",
  "*": "(*, not secure)"
};
const emitMessageToOuter = ({ target }) => {
  bus.target(target).emit("message", {
    id: uuidv1(),
    from: "inner",
    to: targets[target],
    action: {
      type: "ack",
      payload: "inner emitted generic message"
    }
  });
};
const emitClearLogs = ({ target }) => {
  bus.target(target).emit("message", {
    id: uuidv1(),
    from: "inner",
    to: targets[target],
    action: {
      type: "clear",
      payload: "inner requested logs be cleared"
    }
  });
};

class MessageBusLog extends React.Component {
  state = {
    messages: []
  };
  componentDidMount() {
    bus.on("message", data => {
      console.log("In inner", data.from + " said: " + data.contents);

      if (data && data.action && data.action.type === "clear") {
        this.setState(state => {
          return {
            messages: [data]
          };
        });
        return;
      }

      this.setState(state => {
        return {
          messages: [].concat([data], state.messages.slice())
        };
      });
    });
  }
  render() {
    return (
      <div
        style={{
          position: "relative",
          overflowX: "scroll",
          width: "100vw",
          height: "100vh",
          paddingBottom: "50px"
        }}
      >
        <FlipMove
          duration={300}
          typeName={null}
          leaveAnimation="accordionVertical"
          staggerDurationBy={30}
          staggerDelayBy={10}
        >
          {this.state.messages.map((message, i) => (
            <pre
              style={{
                textAlign: "left",
                paddingLeft: "20px",
                width: "50vw",
                wordBreak: "break-all",
                fontSize: "10px",
                color:
                  message.action && message.action.type === "clear"
                    ? "#ccc"
                    : "black"
              }}
              key={message.id}
            >
              {JSON.stringify(message, null, 4)}
            </pre>
          ))}
        </FlipMove>
      </div>
    );
  }
}

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
  width: "100%"
};
class App extends React.Component {
  state = {
    target: outerTarget
  };
  render() {
    return (
      <div style={styles}>
        <div
          style={{
            position: "fixed",
            zIndex: 100,
            top: "0px",
            fontSize: "30px",
            width: "30px",
            margin: "0 auto",
            textAlign: "center",
            letterSpacing: "-15px",
            left: "12px"
          }}
        >
          {this.state.target === innerTarget &&
          this.state.target !== outerTarget
            ? String.fromCharCode(0x2193)
            : null}
          {this.state.target === outerTarget &&
          this.state.target !== innerTarget ? (
            <div
              style={{ webkitTransform: "rotate(90deg)", marginTop: "-7px" }}
            >
              {String.fromCharCode(0x2198)}
            </div>
          ) : null}
          {this.state.target !== outerTarget &&
          this.state.target !== innerTarget ? (
            <div>
              <div
                style={{
                  webkitTransform: "rotate(90deg)",
                  marginTop: "-7px",
                  marginLeft: "-5px"
                }}
              >
                {String.fromCharCode(0x2198)}
              </div>
              <div style={{ position: "relative", marginTop: "-29px" }}>
                {String.fromCharCode(0x2193)}
              </div>
            </div>
          ) : null}
        </div>
        <div
          style={{
            zIndex: 10,
            backgroundColor: "#efefef",
            position: "fixed",
            top: 0,
            width: "100%",
            textAlign: "left",
            paddingLeft: "50px"
          }}
        >
          <h6 style={{ margin: 0 }}>
            Inner frame emits to
            <select
              onChange={e => {
                this.setState({ target: e.target.value });
              }}
            >
              {Object.keys(targets).map(key => (
                <option value={key}>{targets[key]}</option>
              ))}
            </select>
          </h6>
          <button
            onClick={() => emitMessageToOuter({ target: this.state.target })}
          >
            Emit message
          </button>
          <button onClick={() => emitClearLogs({ target: this.state.target })}>
            Clear
          </button>
        </div>
        <div style={{ marginTop: "40px", zIndex: 1 }}>
          <div
            style={{
              zIndex: 100,
              position: "fixed",
              bottom: "10px",
              width: "100%",
              textAlign: "center",
              color: "#ccc"
            }}
          >
            INNER FRAME{" "}
            <div style={{ fontSize: "10px" }}>{window.location.href}</div>
          </div>
          <MessageBusLog />
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
