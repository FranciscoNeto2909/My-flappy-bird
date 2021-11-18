function novoElemento(tag, classe) {
    const elem = document.createElement(tag)
    elem.className = classe
    return elem
}
function Barreira(reversa = false) {
    this.elemento = novoElemento('div','barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.gerarAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.gerarAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura = 300, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //Calculo para saber que o elemento saiu da tela
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.gerarAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio
            && par.getX() < meio 
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true 
    window.onkeyup = e => voando = false
    window.ontouchstart = e => voando = true
    window.ontouchend = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 10 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        }else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}
function Play() {
    this.elemento = novoElemento('button', 'play')
    this.elemento.innerHTML = 'play'
    this.elemento.onclick = () => {
        location.reload()
    }
    this.elemento.ontouchend =  () => {
        location.reload()
    }
}
function sobreposicao(elemA, elemB) {
    const a = elemA.getBoundingClientRect()
    const b = elemB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
    && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
    && b.top + b.height >= a.top

    return vertical && horizontal
}

function colidiu(passaro, barreiras) {
    let colidiu = false 
    barreiras.pares.forEach(ParDeBarreiras =>{
        if (!colidiu) {
            const superior = ParDeBarreiras.superior.elemento
            const inferior = ParDeBarreiras.inferior.elemento
            colidiu = sobreposicao(passaro.elemento, superior)
                || sobreposicao(passaro.elemento, inferior)
        }
    })
    return colidiu
}
function flappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const play = new Play()
    const barreiras = new Barreiras(altura, largura, 200,400, 
        ()=>progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)
    areaDoJogo.appendChild(passaro.elemento)
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(play.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
        
    this.start = ()=>{
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro,barreiras)) {
                clearInterval(temporizador)
            }
        }, 20);
    }
}
 new flappyBird().start()
