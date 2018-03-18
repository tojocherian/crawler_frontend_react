import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery';

class App extends Component {
  constructor(props) {
      super(props)
      this.state = {
          url: '',
          crawlingStatus: null,
          data: null,
          taskID: null,
          uniqueID: null
      }
      this.statusInterval = 1
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event){
    console.log(event.target.value)
    this.setState({url: event.target.value});
  }

  handleSubmit = (event) => {
    if (!this.state.url) return false;



    // fetch("http://127.0.0.1:8000/api/crawl/",{
    //     method: "POST",
    //     body: { url: this.state.url }
    // })
    // .then(function(res){
    //   alert(res.json())
    //    console.log(res.json())  
    //   })

    // send a post request to client when form button clicked
    // django response back with task_id and unique_id.
    // We have created them in views.py file, remember?
    $.post('http://127.0.0.1:8000/api/crawl/', { url: this.state.url, }, resp => {
        if (resp.error) {
            alert(resp.error)
            return
        }
        // Update the state with new task and unique id
        this.setState({
            taskID: resp.task_id,
            uniqueID: resp.unique_id,
            crawlingStatus: resp.status
        }, () => {
            // ####################### HERE ########################
            // After updating state, 
            // i start to execute checkCrawlStatus method for every 2 seconds
            // Check method's body for more details
            // ####################### HERE ########################
            this.statusInterval = setInterval(this.checkCrawlStatus, 1000)
        });
    });
    //end of post
  }

  componentWillUnmount() {
      // i create this.statusInterval inside constructor method
      // So clear it anyway on page reloads or 
      clearInterval(this.statusInterval)
  }

  checkCrawlStatus = () => {
      // this method do only one thing.
      // Making a request to server to ask status of crawling job
      $.get('http://127.0.0.1:8000/api/crawl/?task_id='+this.state.taskID+'&unique_id='+this.state.uniqueID,
            { /*task_id: this.state.taskID, unique_id: this.state.uniqueID*/ }, resp => {
          if (resp.data) {
              // If response contains a data array
              // That means crawling completed and we have results here
              // No need to make more requests.
              // Just clear interval
              clearInterval(this.statusInterval)
              this.setState({
                  data: resp.data
              })
          } else if (resp.error) {
              // If there is an error
              // also no need to keep requesting
              // just show it to user
              // and clear interval
              clearInterval(this.statusInterval)
              alert(resp.error)
          } else if (resp.status) {
              // but response contains a `status` key and no data or error
              // that means crawling process is still active and running (or pending)
              // don't clear the interval.
              this.setState({
                  crawlingStatus: resp.status
              });
          }
      })
  }
  
  render () {
    // render componenet
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Crawler</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
         </p>
            <label>
              Name:
              <input type="text" value={this.state.value} onChange={this.handleChange} />
            </label>
            <button onClick={this.handleSubmit}>
            start
            </button>
          
        {this.state.data != null &&
        <div>
            
                {this.state.data.map((item, index) => (
                    <p key={index}> {index}:{item} </p>
                ))}



               
            <p> {this.state.crawlingStatus}</p>
            </div>
          }
        </div>
    )
  }
}

export default App;
