import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  username = '';
  title = 'TFW';

  setUsername(){
    let input = (<HTMLInputElement>document.getElementById("username"))
    if(input.value != ""){
      this.username = input.value
    }
  }
}
