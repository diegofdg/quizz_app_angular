import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cuestionario } from 'src/app/models/Cuestionario';
import { RespuestaQuizzService } from 'src/app/services/respuesta-quizz.service';

@Component({
  selector: 'app-realizar-quizz',
  templateUrl: './realizar-quizz.component.html',
  styleUrls: ['./realizar-quizz.component.css']
})
export class RealizarQuizzComponent implements OnInit, OnDestroy {
  cuestionario!: Cuestionario;
  nombreParticipante = '';
  segundos = 0;
  indexPregunta = 0;
  setInterval: any;
  loading = false;

  opcionSeleccionada: any;
  indexSeleccionado: any;
  cantidadCorrectas = 0;
  cantidadIncorrectas = 0;
  puntosTotales = 0;
  listRespuestaUsuario: any[] = [];

  constructor(private _respuestaQuizzService: RespuestaQuizzService, private router: Router) { }

  ngOnInit(): void {
    this.cuestionario = this._respuestaQuizzService.cuestionario;
    this.nombreParticipante = this._respuestaQuizzService.nombreParticipante;
    this.validateRefresh();
    this.iniciarContador();
  }

  ngOnDestroy(): void {
    clearInterval(this.setInterval);
  }

  validateRefresh() {
    if(this.cuestionario === undefined) {
      this.router.navigate(['/']);
    }
  }

  obtenerSegundos(): number {
    return this.segundos;
  }

  obtenerTitulo(): string {
    return this.cuestionario.listPreguntas[this.indexPregunta].titulo;
  }

  iniciarContador() {
    this.segundos = this.cuestionario.listPreguntas[this.indexPregunta].segundos;

    this.setInterval = setInterval(() => {
      if(this.segundos === 0) {
        this.agregarRespuesta();
      }

      this.segundos = this.segundos - 1;

    }, 1000);
  }

  respuestaSeleccionada(respuesta: any, index: number) {
    this.opcionSeleccionada = respuesta;
    this.indexSeleccionado = index;
  }

  addClassOption(respuesta: any): string {
    if(respuesta === this.opcionSeleccionada) {
      return 'classSeleccionada';
    } else {
      return '';
    }
  }

  siguiente() {
    clearInterval(this.setInterval)
    this.agregarRespuesta();
    this.iniciarContador();
  }

  agregarRespuesta() {
    this.contadorCorrectaIncorrecta();

    const respuestaUsuario: any = {
      titulo: this.cuestionario.listPreguntas[this.indexPregunta].titulo,
      puntosObtenidos: this.obtenemosPuntosPregunta(),
      segundos: this.obtenemosSegundos(),
      indexRespuestaSeleccionada: this.obtenemosIndexSeleccionado(),
      listRepuestas: this.cuestionario.listPreguntas[this.indexPregunta].listRespuestas,
    }
    this.listRespuestaUsuario.push(respuestaUsuario);

    this.opcionSeleccionada = undefined;
    this.indexSeleccionado = undefined;

    if(this.cuestionario.listPreguntas.length - 1 === this.indexPregunta){
      this.guardamosRespuestaCuestionario();

    } else {
      this.indexPregunta++;
      this.segundos = this.cuestionario.listPreguntas[this.indexPregunta].segundos;
    }    
  }

  obtenemosPuntosPregunta(): number {
    if(this.opcionSeleccionada === undefined) {
      return 0;
    }

    const puntosPregunta = this.cuestionario.listPreguntas[this.indexPregunta].puntos;

    if(this.opcionSeleccionada.esCorrecta == true) {
      this.puntosTotales = this.puntosTotales + puntosPregunta;
      return puntosPregunta;
    } else {
      return 0;
    }
  }

  obtenemosSegundos(): string {
    if(this.opcionSeleccionada === undefined) {
      return 'NO RESPONDIO';
    } else {
      const segundosPregunta = this.cuestionario.listPreguntas[this.indexPregunta].segundos;
      const segundosRespondidos = segundosPregunta - this.segundos;

      return segundosRespondidos.toString();
    }
  }

  obtenemosIndexSeleccionado(): any {
    if(this.opcionSeleccionada === undefined) {
      return '';
    } else {
      return this.indexSeleccionado;
    }
  }

  contadorCorrectaIncorrecta(){
    if(this.opcionSeleccionada === undefined) {
      this.cantidadIncorrectas++;
      return;
    }

    if(this.opcionSeleccionada.esCorrecta === false) {
      this.cantidadIncorrectas++;
    } else {
      this.cantidadCorrectas++;
    }
  }

  guardamosRespuestaCuestionario() {

    const respuestaCuestionario: any = {
      idCuestionario: this.cuestionario.id,
      nombreParticipante: this.nombreParticipante,
      fecha: new Date(),
      cantidadPreguntas: this.cuestionario.cantPreguntas,
      cantidadCorrectas: this.cantidadCorrectas,
      cantidadIncorrectas: this.cantidadIncorrectas,
      puntosTotales: this.puntosTotales,
      listRespuestaUsuario: this.listRespuestaUsuario
    }

    this.loading = true;
    
    this._respuestaQuizzService.setRespuestaUsuario(respuestaCuestionario)
      .then(data => {
        console.log(data);
        this.router.navigate(['/jugar/respuestaUsuario', data.id]);
    }, error => {
      console.log(error);
      this.router.navigate(['/']);
    });
  }

}
