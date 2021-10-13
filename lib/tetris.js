(function () {

    /**
     * Lista de todas as pecas que existem disponiveis
     *
     * @type {{S: number[][], T: number[][], I: number[][], J: number[][], Z: number[][], L: number[][], O: number[][]}}
     */
    const pecas = {
        L: [
            [1, 0],
            [1, 0],
            [1, 1]
        ],
        J: [
            [0, 1],
            [0, 1],
            [1, 1]
        ],
        O: [
            [1, 1],
            [1, 1]
        ],
        T: [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        S: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        Z: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        I: [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0]
        ]
    };

    /**
     * Lista das cores de cada peca
     * @type {{S: string, T: string, I: string, J: string, Z: string, L: string, O: string}}
     */
    const cores = {
        L: 'orange',
        J: 'blue',
        O: 'white',
        T: 'purple',
        S: 'cyan',
        Z: 'red',
        I: 'green'
    };

    // Qual a largura do tabuleiro
    const larguraTabuleiro = 10;

    // Qual a altura do tabuleiro
    const alturaTabuleiro = 20;

    // Representacao do tabuleiro em memoria (não é a mesma coisa que a representação visual)
    let tabuleiro = [];

    // Representacao visual do tabuleiro (tela principal)
    let telaTabuleiro;

    // Representacao visual da proxima peca (tela da proxima peca)
    let telaProximaPeca;

    // A escala horizontal é o numero de pixels correspondente à largura do tabuleiro em pixels a dividir pela largura do tabuleiro
    // ou seja, na pratica corresponde à largura em pixels de cada peca
    let escalaHorizontal;

    // A escala vertical é o número de pixels correspondente à altura do tabuleiro a dividir pela altura do tabuleiro
    // ou seja, na pratica corresponde à altura em pixels de cada peca
    let escalaVertical;

    // variavel que representa a peca actual que está a cair no tabuleiro
    let pecaActual = null;

    // variavel que representa a proxima peca que vai entrar no tabuleiro depois da peca actual ficar presa
    let proximaPeca = null;

    // referencia para o temporizador automatico que vai fazer com que a peca actual caia
    let temporizadorParaPecaActualCair;

    /**
     * Limpa o tabuleiro em memoria para ficar totalmente vazio
     *
     */
    const limparTabuleiro = () => {
        tabuleiro = [];
        for (let y = 0; y < alturaTabuleiro; y++) {
            tabuleiro[y] = new Array(larguraTabuleiro).fill(0);
        }
    };


    /**
     * Inicializa o jogo limpando o tabuleiro, obtendo uma peca e iniciando o proceso de mudar
     * para a proxima peca.
     */
    const comecarJogo = () => {
        limparTabuleiro();
        proximaPeca = obterPecaAleatoria();
        mudarParaAProximaPeca();
    };


    /**
     * Termina o jogo
     */
    const terminarJogo = () => {

    };



    /**
     * Desenha numa dada tela uma determinada matrix. Esta funcao pode ser chamada para
     * desenhar o tabuleiro completo ou para desenhar apenas uma peca.
     *
     * Para executar o desenho, é necessário enviar para a funcao qual a tela onde deve ser feito o desenho
     * e qual a matriz a desenhar.
     *
     * É possivel ainda dizer à funcao para limpar tudo antes de desenhar ou para
     * descolar a matriz a desenhar mais para a direita (deslocarX) ou para baixo (descolarY).
     *
     * Por exemplo, se quisermos desenhar o tabuleiro principal, devemos chamr a funcao assim:
     *
     *      desenharTela(telaTabuleiro, tabuleiro, true)
     *
     * Isto vai desenhar o tabuleiro (representacao em memoria) na tela. Alem disso vai limpar completamente
     * a tela antes de desenhar.
     *
     *
     * @param tela
     * @param matriz
     * @param limparAntesDeDesenhar
     * @param deslocarX
     * @param deslocarY
     */
    const desenharTela = (tela, matriz, limparAntesDeDesenhar = true, deslocarX = 0, deslocarY = 0) => {

        if (tela.getContext) {
            let contexto = tela.getContext('2d');

            if (limparAntesDeDesenhar) {
                contexto.clearRect(0, 0, larguraTabuleiro * escalaHorizontal, alturaTabuleiro * escalaHorizontal);
            }

            for (let y = 0; y < matriz.length; y++) {
                let linha = matriz[y];

                for (let x = 0; x < linha.length; x++) {
                    if (linha[x] != 0) {
                        contexto.fillStyle = cores[linha[x]];
                        contexto.fillRect((x + deslocarX) * escalaHorizontal  + 1, (y + deslocarY) * escalaVertical + 1, escalaHorizontal - 2, escalaVertical - 2);
                    }
                }
            }
        }
    };

    /**
     * Esta funcão serve para verificar se a peca actual pode ser colocada numa dada
     * posicao dentro do tabuleiro.
     *
     * @param posicaoX
     * @param posicaoY
     * @returns {boolean}
     */
    const possoColocarPecaActual = (posicaoX, posicaoY) => {
        posicaoX = posicaoX || pecaActual.posicaoX;
        posicaoY = posicaoY || pecaActual.posicaoY;
        return possoColocarPeca(pecaActual.peca, posicaoX, posicaoY);
    };

    /**
     * Verifica se uma dada peca pode ser colocada numa data posicao
     * do tabuleiro
     *
     * @param posicaoX
     * @param posicaoY
     * @returns {boolean}
     */
    const possoColocarPeca = (peca, posicaoX, posicaoY) => {
        for (let y = 0; y < peca.length; y++) {
            for (let x = 0; x < peca[y].length; x++) {
                if (peca[y][x] != 0) {
                    let posicaoXFinal = posicaoX + x;
                    let posicaoYFinal = posicaoY + y;
                    if (posicaoYFinal < 0
                        || posicaoXFinal < 0
                        || posicaoYFinal >= tabuleiro.length
                        || posicaoXFinal >= tabuleiro[posicaoYFinal].length
                        || tabuleiro[posicaoYFinal][posicaoXFinal] != 0
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    /**
     * Verifica se a peca actual pode ser deslocada para uma dada posicão,
     * desloca a peca e faz o desenho do tabuleiro e da peca actual na posicao dada
     *
     * @param posicaoX
     * @param posicaoY
     */
    const moverPecaActual = (posicaoX, posicaoY) => {
        if (possoColocarPecaActual(posicaoX, posicaoY)) {
            clearTimeout(temporizadorParaPecaActualCair);
            pecaActual.posicaoX = posicaoX;
            pecaActual.posicaoY = posicaoY;
            desenharTela(telaTabuleiro, tabuleiro, true, 0, 0);
            desenharTela(telaTabuleiro, pecaActual.peca, false, pecaActual.posicaoX, pecaActual.posicaoY);
            fazerAPecaActualCair();
        }
    };

    /**
     * Esta funcao faz com que a peca actual caia uma posicao. Quando chamada, o codigo de deslocar a
     * peca nao é executado imediatamente. É iniciado um temporizador que espera alguns milisegundos.
     *
     * Despois de terminado o tempo de espera, primeiro o codigo verifica se a peca pode ser colocada
     * Caso possa ser colocada, desenha a peca e incrementa a posicaoY para a proxima execucao. Depois disto,
     * a funcao chama-se a si própria novamente "fazerAPecaActualCair();" para repetir o processo
     *
     * Caso nao seja possivel colocar a peca, entao significa que a peca bateu no fim do tabuleiro ou bateu
     * noutra peca que já estava colocada. Nesse caso, o temporizador é parado (para que a peca nao se mexa mais)
     * atraves do código "clearTimeout(temporizadorParaPecaActualCair);"
     * Depois de parar o temporizador, a peca actual é copiada para o tabuleiro de forma a ficar lá
     * permanentemente
     *
     */
    const fazerAPecaActualCair = () => {
        temporizadorParaPecaActualCair = setTimeout(() => {
            if (possoColocarPecaActual()) {
                desenharTela(telaTabuleiro, tabuleiro);
                desenharTela(telaTabuleiro, pecaActual.peca, false, pecaActual.posicaoX, pecaActual.posicaoY);
                pecaActual.posicaoY++;
                fazerAPecaActualCair();
            } else {
                clearTimeout(temporizadorParaPecaActualCair);
                for (let y = 0; y < pecaActual.peca.length; y++) {
                    for (let x = 0; x < pecaActual.peca[y].length; x++) {
                        if (pecaActual.peca[y][x] != 0) {
                            tabuleiro[pecaActual.posicaoY - 1 + y][pecaActual.posicaoX + x] = pecaActual.tipoDePeca;
                        }
                    }
                }
                mudarParaAProximaPeca();
            }
        }, 300);
    };

    /**
     * Verifica se existem linhas completas. As linhas completas são identificadas
     * e removidas do tabuleiro. É introduzido no topo de tabuleiro um número de linhas vazias
     * equivalente ao número de linhas que foram removidas
     *
     */
    const verificarELimparLinhasCompletas = () => {
        let linhasARemover = [];
        for (let y = 0; y < alturaTabuleiro; y++) {
            let linhaEstaCompleta = true;

            for (let x = 0; x < larguraTabuleiro; x++) {
                if (tabuleiro[y][x] == 0) {
                    linhaEstaCompleta = false;
                    break;
                }
            }


            if (linhaEstaCompleta) {
                linhasARemover.push(y);
            }
        }

        linhasARemover.forEach(y => {
            tabuleiro.splice(y, 1);
            tabuleiro.unshift(new Array(larguraTabuleiro).fill(0));
        })
    };

    /**
     * Retorna uma peca aleatoria. A peca tem uma posicao inicial, a matriz da peca propriamente dita
     * e a indicacao do tipo de peca.
     *
     * Uma nota importante é que na definicao de pecas, as matrizes são definidas com zeros e ums (0 / 1) para
     * indicar a forma da peca. No entanto, quando a peca aleatória é criada, os ums (1) são substituidos
     * pela letra que representa a peca.
     *
     * Por exemplo, caso seja um T, a matriz original é:
     *
     *      0 0 0
     *      0 1 0
     *      1 1 1
     *
     * A matriz da peca aleatoria vai ficar:
     *
     *      0 0 0
     *      0 T 0
     *      T T T
     *
     * Esta alteracao é usada para simplificar o processo de desenho e podermos atribuir uma cor diferente
     * a cada peca.
     *
     */
    const obterPecaAleatoria = () => {
        let names = Object.keys(pecas);
        let p = names[Math.floor(Math.random() * names.length)];
        let peca = pecas[p];
        let pecaAleatoria = {};
        pecaAleatoria.posicaoX = 4;
        pecaAleatoria.posicaoY = 0;
        pecaAleatoria.peca = peca.map(r => r.map(v => v ? p : v));
        pecaAleatoria.tipoDePeca = p;

        return pecaAleatoria;
    };

    /**
     * Muda para a proxima peca. A peca actual é substituida pela próxima peca
     * e é definida uma proxima peca aleatoria.
     *
     * Caso seja possível colocar a peca no tabuleiro, entao é chamada a funcao
     * que faz a peça cair
     *
     * O jogo termina caso nao seja possivel colocar a peca actual (antiga proxima peca)
     * no tabuleiro.
     *
     */
    const mudarParaAProximaPeca = () => {

        // coloca a peca actual igual à proxima peca
        pecaActual = proximaPeca;

        // substitui a proxima peca por uma peca aleatória
        proximaPeca = obterPecaAleatoria();

        // desenha a proxima peca na respectiva tela
        desenharTela(telaProximaPeca, proximaPeca.peca);

        // verifica se existem linhaas a eliminar
        verificarELimparLinhasCompletas();

        // verifica se é possivel colocar a peca actual no tabuleiro
        if (possoColocarPecaActual()) {
            fazerAPecaActualCair();
        } else {
            terminarJogo();
        }
    };


    /**
     * Roda a peça actual 90 graus. Caso seja possivel colocar no tabuleiro a peça rodada,
     * entao a peca actual é substituida pela peca rodada e a tela do tabuleiro
     * é desenhada com a peca rodada.
     */
    const rodarPecaActual = () => {

        let novaPeca = pecaActual.peca[0].map((val, index) => pecaActual.peca.map(row => row[index]).reverse());

        if (possoColocarPeca(novaPeca, pecaActual.posicaoX, pecaActual.posicaoY)) {
            pecaActual.peca = novaPeca;
            desenharTela(telaTabuleiro, tabuleiro, true, 0, 0);
            desenharTela(telaTabuleiro, pecaActual.peca, false, pecaActual.posicaoX, pecaActual.posicaoY);
        }
    };

    /**
     * Captura o eventos criados quando uma tecla no teclado é pressionada.
     * Os eventos analisados são as setas para cima, direita, baixo e esquerda.
     *
     * @param event
     */
    window.onkeydown = (event) => {
        if (pecaActual.peca) {

            switch (event.key) {
                case 'ArrowDown':
                    moverPecaActual(pecaActual.posicaoX, pecaActual.posicaoY + 1);
                    break;
                case 'ArrowUp':
                    rodarPecaActual();
                    break;
                case 'ArrowLeft':
                    moverPecaActual(pecaActual.posicaoX - 1, pecaActual.posicaoY);
                    break;
                case 'ArrowRight':
                    moverPecaActual(pecaActual.posicaoX + 1, pecaActual.posicaoY);
                    break;
            }
        }
    };

    /**
     * Captura o evento executado quando a página termina o processo de carregamento. Quando isto
     * acontece, o jogo está pronto para ser iniciado.
     *
     * Esta função localiza elementos no HTML (como o tabuleiro e a proxima peca) e
     * liga esses elementos às variaveis no programa de forma a que seja possível
     * o programa interagir com o interface visual
     */
    window.onload = () => {
        telaTabuleiro = document.getElementById('tabuleiro');
        telaProximaPeca = document.getElementById('proximaPeca');
        escalaHorizontal = telaTabuleiro.getAttribute('width') / larguraTabuleiro;
        escalaVertical = telaTabuleiro.getAttribute('height') / alturaTabuleiro;
        comecarJogo();
    }
})();